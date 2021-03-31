const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
import npx from './npx-setup';
import { initializeKubeconfig } from './utils/kubeconfig';
import { requestLogger } from './utils/other';

const app = express();
app.use(express.raw({ type: '*/*' }));
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*' }));
}

const server = http.createServer(app);
const kubeconfig = initializeKubeconfig(
  process.env.KUBECONFIG || npx.getKubeconfigPath(),
);
const k8sUrl = new URL(
  kubeconfig.getCurrentCluster().server !== 'https://undefined:undefined'
    ? kubeconfig.getCurrentCluster().server
    : 'http://doesntexist',
);

// requestLogger(require("http")); //uncomment this to log the outgoing traffic
// requestLogger(require("https")); //uncomment this to log the outgoing traffic

const port = process.env.PORT || 3001;
const address = process.env.ADDRESS || 'localhost';
console.log(`K8s server used: ${k8sUrl}`);

const isHeaderNotDefined = (headers, headerName) => {
  return (
    !headers[headerName] === undefined || headers[headerName] === 'undefined'
  );
};

const handleRequest = async (req, res) => {
  const urlHeader = 'x-cluster-url';
  const caHeader = 'x-cluster-certificate-authority-data';

  delete req.headers.host; // remove host in order not to confuse APIServer

  const targetApiServer = isHeaderNotDefined(req.headers, urlHeader)
    ? k8sUrl.hostname
    : req.headers[urlHeader];
  const ca = isHeaderNotDefined(req.headers, caHeader)
    ? null
    : Buffer.from(req.headers[caHeader], 'base64');
  delete req.headers[urlHeader];
  delete req.headers[caHeader];

  const options = {
    hostname: targetApiServer,
    path: req.originalUrl.replace(/^\/backend/, ''),
    headers: req.headers,
    body: req.body,
    method: req.method,
    port: k8sUrl.port || 443,
    ca,
  };
  console.log(options);
  npx.adjustRequestOptions(options, kubeconfig);

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
