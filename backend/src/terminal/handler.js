/* global Buffer */
import { WebSocket, WebSocketServer } from 'ws';
import parseProtocolHeaders from './protocolHeaderParser';
import { pinoWebSocketLogger } from '../../logging/';
import { InvalidInputError } from '../errors/errors';

function buildRemoteURL(url, remoteURL) {
  const remoteServerAddress = remoteURL.replace('https://', '');
  const path = url.pathname.split('/').slice(3).join('/'); //remove /backend/ws
  return `wss://${remoteServerAddress}/${path}${url.search}`;
}

//this const is only for URL constructor as it requires it
const baseURLStub = 'https://localhost';

const webSocketPath = '/backend/ws/';

const Stream = Object.freeze({
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2,
});

function encodeMsg(input, std = Stream.STDIN) {
  const msgEncoded = Buffer.from(input + '\n', 'utf-8');
  const encodedMsgForK8s = new Uint8Array(msgEncoded.length + 1);
  encodedMsgForK8s[0] = std; // set STD[IN,OUT,ERR]
  encodedMsgForK8s.set(msgEncoded, 1);
  return encodedMsgForK8s;
}

const handleUpgrade = (webSocketServer) => {
  return function (req, socket, head) {
    const logger = pinoWebSocketLogger(req);
    logger.info({ url: req.url }, 'Upgrade Triggered');
    const { pathname } = new URL(req.url, baseURLStub);
    logger.info(req.headers);
    if (!pathname.startsWith(webSocketPath)) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      return;
    }

    let parsedHeaders;
    try {
      parsedHeaders = parseProtocolHeaders(
        req.headers['sec-websocket-protocol'],
      );
    } catch (e) {
      if (e instanceof InvalidInputError) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        return;
      }
      logger.error({ err: e }, 'Error during parsing headers');
    }

    req.logger = logger;
    req.authHeaders = parsedHeaders;
    webSocketServer.handleUpgrade(req, socket, head, function done(ws) {
      webSocketServer.emit('connection', ws, req);
    });
  };
};

/**
 * This is websocket endpoint
 * The validation is done on HTTP Upgrade request
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Upgrade
 *
 * To connect to any k8s cluster the client must provide
 * - ClusterURL
 * - Cluster CA CERT
 * - Bearer Token or client key,client cert
 * Those values has to be sent in header `protocol`, because the WebBrowser API is very minimal and it's the simpliest way to pass data
 * All those values has to be encoded in BASE64URL (not BASE64, because Web Browser WebSocket API cannot handle '=' sings)
 * The header structure should looks like that:
 * sec-websocket-protocol: v4.channel.k8s.io, base64.header.[what].value.[base64url encoded value]
 * All certs should be encoded by base64 which is already in kubeconfig file and base64URL.
 * TODO: we can consider to decode base64 and encode in base64URL on frontend side
 */
export default function registerWebSocket(server) {
  const webSocketServer = new WebSocketServer({ noServer: true });
  server.on('upgrade', handleUpgrade(webSocketServer));

  webSocketServer.on('connection', (frontWS, req) => {
    req.logger.info('Starting WebSocket connection proxy');
    try {
      const url = new URL(req.url, 'http://' + req.socket.remoteAddress);
      const remoteURL = buildRemoteURL(url, req.authHeaders.clusterURL);
      req.logger.info('Connecting to:' + remoteURL);

      let opts;
      if (req.authHeaders.token) {
        opts = {
          ca: req.authHeaders.ca,
          headers: {
            Authorization: req.authHeaders.token,
          },
        };
      } else {
        opts = {
          ca: req.authHeaders.ca,
          cert: req.authHeaders.clientCert,
          key: req.authHeaders.clientKey,
        };
      }
      const k8sWS = new WebSocket(remoteURL, [req.authHeaders.protocol], opts);

      k8sWS.addEventListener('open', () => {
        // TODO: Currently the busola terminal uses default service account which has 0 permissions to access k8s api.
        // We can try to build kubeconfig and add it to env
        // TODO: This is a help command executed at the begining of connection, we can change or remove it completely.
        const msg = 'kubectl';
        k8sWS.send(encodeMsg(msg));
      });

      k8sWS.addEventListener('message', (event) => {
        if (frontWS.readyState === WebSocket.OPEN) {
          const data = event.data;
          frontWS.send(data);
        } else {
          req.logger.info(
            'Front WS is not open, cannot send message, status: ' +
              frontWS.readyState,
          );
        }
      });

      k8sWS.addEventListener('onerror', (event) => {
        logger.error({ err: event }, 'K8s WebSocket error: ');
      });

      k8sWS.addEventListener('onclose', () => {
        req.logger.info('K8s WebSocket closed');
        const closingMsg = 'Remote connection closed';
        frontWS.send(encodeMsg(closingMsg, Stream.STDOUT));
        frontWS.close();
      });

      frontWS.addEventListener('error', (event) => {
        req.logger.error({ err: event }, 'Front WebSocket error: ');
      });

      frontWS.addEventListener('message', (event) => {
        if (k8sWS.readyState === WebSocket.OPEN) {
          const data = event.data;
          k8sWS.send(data);
        } else {
          req.logger.info(
            'Front WS is not open, cannot send message, status: ' +
              k8sWS.readyState,
          );
        }
      });

      frontWS.addEventListener('close', () => k8sWS.close());
    } catch (e) {
      frontWS.close(1011, encodeMsg('Internal Server Error', Stream.STDOUT));
      req.logger.error({ err: e }, 'Error during WebSocket proxy connections');
    }
  });
}
