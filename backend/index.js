const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const url = require('url');

import npx from './npx-setup';
import { requestLogger } from './utils/other';

npx.setup();

const app = express();
app.use(express.raw({ type: '*/*' }));
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*' }));
}

const server = http.createServer(app);
// requestLogger(require("http")); //uncomment this to log the outgoing traffic
// requestLogger(require("https")); //uncomment this to log the outgoing traffic

const port = process.env.PORT || 3001;
const address = process.env.ADDRESS || 'localhost';

const isHeaderDefined = headerValue => {
  return headerValue !== undefined && headerValue !== 'undefined';
};

const decodeHeaderToBuffer = headerValue => {
  return isHeaderDefined(headerValue)
    ? Buffer.from(headerValue, 'base64')
    : null;
};

const handleRequest = async (req, res) => {
  const urlHeader = 'x-cluster-url';
  const caHeader = 'x-cluster-certificate-authority-data';
  const clientCAHeader = 'x-client-certificate-data';
  const clientKeyDataHeader = 'x-client-key-data';

  delete req.headers.host; // remove host in order not to confuse APIServer

  const targetApiServer = url.parse(req.headers[urlHeader]);

  const ca = decodeHeaderToBuffer(req.headers[caHeader]);
  const cert = decodeHeaderToBuffer(req.headers[clientCAHeader]);
  const key = decodeHeaderToBuffer(req.headers[clientKeyDataHeader]);

  delete req.headers[urlHeader];
  delete req.headers[caHeader];
  delete req.headers[clientCAHeader];
  delete req.headers[clientKeyDataHeader];

  const options = {
    hostname: targetApiServer.hostname,
    path: req.originalUrl.replace(/^\/backend/, ''),
    headers: req.headers,
    body: req.body,
    method: req.method,
    port: targetApiServer.port || 443,
    ca,
    cert,
    key,
  };

  const k8sRequest = https
    .request(options, function(k8sResponse) {
      res.writeHead(k8sResponse.statusCode, {
        'Content-Type': k8sResponse.headers['Content-Type'] || 'text/json',
        'Content-Encoding': k8sResponse.headers['content-encoding'] || '',
      });

      k8sResponse.pipe(res);
    })
    .on('error', function(err) {
      console.error('Internal server error thrown', err);
      res.statusMessage = 'Internal server error';
      res.statusCode = 500;
      res.end(Buffer.from(JSON.stringify({ message: err })));
    });

  k8sRequest.end(Buffer.isBuffer(req.body) ? req.body : undefined);
  req.pipe(k8sRequest);
};

if (npx.isNpxEnv()) {
  npx.setupRoutes(app, handleRequest);
} else {
  app.use(handleRequest);
}

server.listen(port, address, () => {
  console.log(`Busola backend server started @ ${port}!`);
  npx.openBrowser(port);
});
