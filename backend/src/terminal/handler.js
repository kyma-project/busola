import { WebSocket, WebSocketServer } from 'ws';

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

  wss.on('connection', (frontWS, req) => {
    console.log('client connected from', req.socket.remoteAddress);
    const url = new URL(req.url, 'http://' + req.socket.remoteAddress);
    const headers = createHeadersFromRaw(req.rawHeaders);
    console.log(req.url);

    const pureURL = url.pathname.split('/').slice(2);
    const remoteServerAddress = 'wss://' + headers['X-Cluster-URL']; //url.searchParams.get('remoteURL');
    url.searchParams.delete('remoteURL');
    const remoteURL = `${remoteServerAddress}/${pureURL.join('/')}?${url.search}`;
    console.log('Connecting to: ', remoteURL);
    const ca = Buffer.from(
      headers['X-Cluster-Certificate-Authority-Data'],
      'base64',
    );
    const cert = Buffer.from(
      headers['X-Cluster-Client-Certificate-Data'],
      'base64',
    );
    const key = Buffer.from(headers['X-Cluster-Client-Key-Data'], 'base64');
    // console.log(ca);
    // console.log(cert);
    // console.log(key);

    function encodeMsg(input) {
      const msgEncoded = enccoder.encode(input);

      const superMsg = new Uint8Array(msgEncoded.length + 1);
      superMsg[0] = 0;
      superMsg.set(msgEncoded, 1);
      return superMsg;
    }
    // TODO: Improve extraction of security headers and add protocol header
    const k8sWS = new WebSocket(remoteURL, ['v5.channel.k8s.io'], {
      ca,
      cert,
      key,
      rejectUnauthorized: false,
    });

    const enccoder = new TextEncoder();

    k8sWS.addEventListener('open', (event) => {
      console.log('Opened websocket', event);
      const msg = 'dasdasda';
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
      Thttps: k8sWS.send(encodeMsg(data));
    });
    frontWS.on('open', () => {
      console.log('open');
      frontWS.send('dupa');
    });
    frontWS.on('close', () => console.log('closing busola backend connection'));
  });

  // server.on('upgrade', (req, socket, head) => {
  //   console.log(req.url);
  //   const { pathname } = new URL(req.url, 'http://localhost');
  //   if (pathname.startsWith('/ws')) {
  //     console.log('upgrade');
  //     oldWss.handleUpgrade(req, socket, head, (ws) => {
  //       ws.emit('connection', ws, req);
  //     });
  //     socket.destroy();
  //   } else {
  //     socket.destroy();
  //     console.log('Unknown path');
  //   }
  // });
}
