const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
import { handleRequest, serveStaticApp, serveMonaco } from './common';
//import { requestLogger } from './utils/other'; //uncomment this to log the outgoing traffic
const { setupJWTCheck } = require('./jwtCheck');

let gzipEnabled;
try {
  gzipEnabled = JSON.parse(fs.readFileSync('./config/config.json'))?.config
    ?.features?.GZIP?.isEnabled;
} catch (e) {
  console.log('Error while reading the configuration file', e?.message || e);
}

const app = express();
app.disable('x-powered-by');
app.use(express.raw({ type: '*/*', limit: '100mb' }));
if (gzipEnabled) app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*' }));
}
setupJWTCheck(app);

let server = null

if (process.env.BUSOLA_SSL_ENABLED == 1 && process.env.BUSOLA_SSL_KEY_FILE != "" && process.env.BUSOLA_SSL_CRT_FILE != "" && process.env.BUSOLA_SSL_CA_FILE != "") {
  const https = require('https');
  const fs = require('fs');
  const options = {
    requestCert: true,
    rejectUnauthorized: false,
    key: fs.readFileSync(process.env.BUSOLA_SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.BUSOLA_SSL_CRT_FILE),
    ca: fs.readFileSync(process.env.BUSOLA_SSL_CA_FILE),
  };
  server = https.createServer(options, app);
} else {
  const http = require('http');
  server = http.createServer(app);
}

// requestLogger(require("http")); //uncomment this to log the outgoing traffic
// requestLogger(require("https")); //uncomment this to log the outgoing traffic

const port = process.env.PORT || 3001;
const address = process.env.ADDRESS || 'localhost';
const isDocker = process.env.IS_DOCKER === 'true';

if (isDocker) {
  // yup, order matters here
  serveStaticApp(app, '/core-ui/', '/core-ui');
  serveStaticApp(app, '/service-catalog', '/service-catalog-ui');
  serveMonaco(app);
  app.use('/backend', handleRequest);
  serveStaticApp(app, '/', '/core');
} else {
  app.use(handleRequest);
}

process.on('SIGINT', function() {
  process.exit();
});

server.listen(port, address, () => {
  console.log(`Busola backend server started @ ${port}!`);
});
