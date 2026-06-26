/* global Buffer */
import { WebSocket, WebSocketServer } from 'ws';
import parseProtocolHeaders from './protocolHeaderParser';

function buildRemoteURL(url, remoteURL) {
  const remoteServerAddress = remoteURL.replace('https://', '');
  const path = url.pathname.split('/').slice(3).join('/'); //remove /backend/ws
  return `wss://${remoteServerAddress}/${path}${url.search}`;
}

function encodeMsg(input, std = 0) {
  const msgEncoded = Buffer.from(input + '\n', 'utf-8');
  const encodedMsgForK8s = new Uint8Array(msgEncoded.length + 1);
  encodedMsgForK8s[0] = std; // set STD[IN,OUT,ERR]
  encodedMsgForK8s.set(msgEncoded, 1);
  return encodedMsgForK8s;
}

export default function registerWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (frontWS, req) => {
    try {
      const url = new URL(req.url, 'htt://' + req.socket.remoteAddress);
      const parsedHeaders = parseProtocolHeaders(
        req.headers['sec-websocket-protocol'],
      );

      const remoteURL = buildRemoteURL(url, parsedHeaders.clusterURL);
      console.log('Connecting to: ', remoteURL);

      let opts;
      if (parsedHeaders.token) {
        opts = {
          ca: parsedHeaders.ca,
          headers: {
            Authorization: parsedHeaders.token,
          },
        };
      } else {
        opts = {
          ca: parsedHeaders.ca,
          cert: parsedHeaders.clientCert,
          key: parsedHeaders.clientKey,
        };
      }
      const k8sWS = new WebSocket(remoteURL, [parsedHeaders.protocol], opts);

      k8sWS.addEventListener('open', () => {
        // TODO: we can try to build kubeconfig and add it to env
        const msg = 'kubectl';
        k8sWS.send(encodeMsg(msg));
      });

      k8sWS.addEventListener('message', (event) => {
        const data = event.data;
        // TODO: Should we check if frontWS is live?
        frontWS.send(data);
      });

      k8sWS.addEventListener('onclose', () => {
        console.log('Frontend closed');
        const closingMsg = 'Remote connection closed';
        frontWS.send(encodeMsg(closingMsg));
        frontWS.close();
      });

      k8sWS.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        //   TODO:
      });

      frontWS.on('error', console.log);

      frontWS.on('message', (data) => {
        if (k8sWS.readyState.readyState !== WebSocket.OPEN) {
          // error handling
        }
        k8sWS.send(data);
      });

      frontWS.on('close', () => k8sWS.close());
    } catch (e) {
      frontWS.close(1000, 'Internal Server Error');
      console.error(e);
    }
  });
}
