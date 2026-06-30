/* global Buffer */
import { WebSocket, WebSocketServer } from 'ws';
import parseProtocolHeaders from './protocolHeaderParser';
import { pinoWebSocketLogger } from '../../logging/';

function buildRemoteURL(url, remoteURL) {
  const remoteServerAddress = remoteURL.replace('https://', '');
  const path = url.pathname.split('/').slice(3).join('/'); //remove /backend/ws
  return `wss://${remoteServerAddress}/${path}${url.search}`;
}
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

export default function registerWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (frontWS, req) => {
    const logger = pinoWebSocketLogger(req);
    logger.info('Starting WebSocket connection proxy');
    try {
      const url = new URL(req.url, 'htt://' + req.socket.remoteAddress);
      const parsedHeaders = parseProtocolHeaders(
        req.headers['sec-websocket-protocol'],
      );

      const remoteURL = buildRemoteURL(url, parsedHeaders.clusterURL);
      logger.info('Connecting to:' + remoteURL);

      let opts;
      if (parsedHeaders.token) {
        opts = {
          ca: parsedHeaders.ca,
          headers: {
            Authorization: parsedHeaders.token,
          },
        };
      } else if (parsedHeaders.clientKey && parsedHeaders.clientKey) {
        opts = {
          ca: parsedHeaders.ca,
          cert: parsedHeaders.clientCert,
          key: parsedHeaders.clientKey,
        };
      } else {
        frontWS.close(
          1008,
          encodeMsg('Not sufficient Auth data provided', Stream.STDOUT),
        );
        return;
      }
      const k8sWS = new WebSocket(remoteURL, [parsedHeaders.protocol], opts);

      k8sWS.addEventListener('open', () => {
        // TODO: Currently the busola terminal uses default service account which has 0 permissions to access k8s api.
        // We can try to build kubeconfig and add it to env
        // TODO: This is a help command executed at the begining of connection, we can change or remove it completely.
        const msg = 'kubectl';
        k8sWS.send(encodeMsg(msg));
      });

      k8sWS.addEventListener('message', (event) => {
        if (frontWS.readyState === ws.OPEN) {
          const data = event.data;
          frontWS.send(data);
        } else {
          logger.info(
            'Front WS is not open, cannot send message, status: ' +
              frontWS.readyState,
          );
        }
      });

      k8sWS.addEventListener('onerror', (event) => {
        logger.error({ err: event }, 'K8s WebSocket error: ');
      });

      k8sWS.addEventListener('onclose', () => {
        logger.info('K8s WebSocket closed');
        const closingMsg = 'Remote connection closed';
        frontWS.send(encodeMsg(closingMsg, stream.STDOUT));
        frontWS.close();
      });

      frontWS.addEventListener('error', (event) => {
        logger.error({ err: event }, 'Front WebSocket error: ');
      });

      frontWS.on('message', (data) => {
        if (k8sWS.readyState === ws.OPEN) {
          const data = event.data;
          frontWS.send(data);
        } else {
          logger.info(
            'Front WS is not open, cannot send message, status: ' +
              k8sWS.readyState,
          );
        }
      });

      frontWS.on('close', () => k8sWS.close());
    } catch (e) {
      frontWS.close(1011, encodeMsg('Internal Server Error', Stream.STDOUT));
      logger.error({ err: e }, 'Error during WebSocket proxy connections');
    }
  });
}
