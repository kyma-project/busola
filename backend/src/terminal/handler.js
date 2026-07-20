import { WebSocketServer } from 'ws';
import parseProtocolHeaders from './protocolHeaderParser';
import { pinoWebSocketLogger } from '../../logging/';
import { InvalidInputError } from '../errors/errors';
import { WebSocketConnection } from './connection';

function buildRemoteURL(url, remoteURL) {
  const remoteServerAddress = remoteURL.replace('https://', '');
  const path = url.pathname.slice(webSocketPath.length); //remove /backend/ws
  return `wss://${remoteServerAddress}/${path}${url.search}`;
}

//this const is only for URL constructor as it requires it
const baseURLStub = 'https://localhost';

const webSocketPath = '/backend/ws/';

const handleUpgrade = (webSocketServer) => {
  return function (req, socket, head) {
    const logger = pinoWebSocketLogger(req);
    logger.info({ url: req.url }, 'Upgrade Triggered');
    const { pathname } = new URL(req.url, baseURLStub);
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
      } else {
        socket.end('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        logger.error({ err: e }, 'Error during parsing headers');
      }
      return;
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
    let connection = null;
    req.logger.info('Starting WebSocket connection proxy');
    try {
      const url = new URL(req.url, 'http://' + req.socket.remoteAddress);
      const remoteURL = buildRemoteURL(url, req.authHeaders.clusterURL);
      req.logger.info('Connecting to:' + remoteURL);

      connection = new WebSocketConnection(
        remoteURL,
        frontWS,
        req.authHeaders,
        req.logger,
      );

      connection.connect();
    } catch (e) {
      req.logger.error({ err: e }, 'Error during WebSocket proxy connections');
      connection?.close('Internal Server Error');
    }
  });
}
