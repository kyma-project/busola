import { WebSocket, WebSocketServer } from 'ws';
import parseProtocolHeaders from './protocolHeaderParser';

const oldWss = new WebSocketServer({ noServer: true });

oldWss.on('connection', (ws, req) => {
  console.log('client connected from', req.socket.remoteAddress);
  oldWss.on('error', console.log);
  oldWss.on('message', (data) => {
    console.log('received data');
  });
  oldWss.on('open', () => {
    oldWss.send('dupa');
  });
});

function createHeadersFromRaw(rawHeaders) {
  const headers = {};
  const size = rawHeaders.length;
  for (let i = 0; i < size / 2; i++) {
    headers[rawHeaders[2 * i]] = rawHeaders[2 * i + 1];
  }
  return headers;
}

export default function registerWebSocket(server) {
  const wss = new WebSocketServer({ server });

  try {
    wss.on('connection', (frontWS, req) => {
      console.log('client connected from', req.socket.remoteAddress);
      const url = new URL(req.url, 'http://' + req.socket.remoteAddress);
      const headers = createHeadersFromRaw(req.rawHeaders);
      console.log(req.url);

      const pureURL = url.pathname.split('/').slice(3);
      const parsedHeaders = parseProtocolHeaders(
        headers['sec-websocket-protocol'],
      );
      const remoteServerAddress =
        'wss://' + parsedHeaders.clusterURL.replace('https://', '');
      console.log(url.search);
      console.log(pureURL.join('/'));
      const remoteURL = `${remoteServerAddress}/${pureURL.join('/')}${url.search}`;
      console.log('Connecting to: ', remoteURL);

      function encodeMsg(input) {
        const msgEncoded = enccoder.encode(input);

        const superMsg = new Uint8Array(msgEncoded.length + 1);
        superMsg[0] = 0;
        superMsg.set(msgEncoded, 1);
        return superMsg;
      }
      // TODO: Improve extraction of security headers and add protocol header
      const k8sWS = new WebSocket(remoteURL, [parsedHeaders.protocol], {
        ca: parsedHeaders.ca,
        cert: parsedHeaders.clientCert,
        key: parsedHeaders.clientKey,
        rejectUnauthorized: false,
      });

      const enccoder = new TextEncoder();

      k8sWS.addEventListener('open', (event) => {
        console.log('Opened websocket', event);
        const msg = 'kubectl';
        k8sWS.send(encodeMsg(msg));
      });

      k8sWS.addEventListener('message', (event) => {
        const data = event.data;
        console.log(`sending data: ${data}`);
        frontWS.send(data);
      });

      k8sWS.addEventListener('onclose', (event) => {
        console.error('WebSocket onclose:', event);
      });

      k8sWS.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });

      frontWS.on('error', console.log);
      frontWS.on('message', (data) => {
        frontWS.send(`echo: ${data}`);
        console.log('k8sWS state ', k8sWS.readyState);
        console.log(`received data: ${data}`);
        if (k8sWS.readyState.readyState !== WebSocket.OPEN) {
          // error handling
        } //github.com/gardener/dashboard/blob/97e293505d6daad0283adec159e8153c68936f18/frontend/src/lib/terminal.js#L160-L161
        k8sWS.send(data);
      });
      frontWS.on('open', () => {
        console.log('open');
        frontWS.send('dupa');
      });
      frontWS.on('close', () =>
        console.log('closing busola backend connection'),
      );
    });
  } catch (e) {
    console.error(e);
  }
}
