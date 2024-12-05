import { makeHandleRequest, serveStaticApp, serveMonaco } from './common';
import { proxyHandler } from './proxy.js';
import { handleTracking } from './tracking.js';
import jsyaml from 'js-yaml';
//import { requestLogger } from './utils/other'; //uncomment this to log the outgoing traffic

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const merge = require('lodash.merge');

global.config = {};

try {
  // config from the copnfiguration file

  const defaultConfig = jsyaml.load(
    fs.readFileSync('./settings/defaultConfig.yaml'),
  );

  // config retrieved from busola's config map
  // path exist after docker build
  if (fs.existsSync('./config/config.yaml')) {
    const configFromMap = jsyaml.load(fs.readFileSync('./config/config.yaml'));
    global.config = merge(defaultConfig, configFromMap).config;
  } else {
    global.config = defaultConfig.config;
  }
} catch (e) {
  console.log('Error while reading the configuration files', e?.message || e);
}

const app = express();
app.disable('x-powered-by');
app.use(express.raw({ type: '*/*', limit: '100mb' }));

const gzipEnabled = global.config.features?.GZIP?.isEnabled;
if (gzipEnabled)
  app.use(
    compression({
      filter: (req, res) => {
        if (/\?.*follow=/.test(req.originalUrl)) {
          // compression interferes with ReadableStreams. Small chunks are not transmitted for unknown reason
          return false;
        }
        // fallback to standard filter function
        return compression.filter(req, res);
      },
    }),
  );

if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*' }));
}
app.use('/proxy', proxyHandler);

let server = null;

if (
  process.env.BUSOLA_SSL_ENABLED === 1 &&
  process.env.BUSOLA_SSL_KEY_FILE !== '' &&
  process.env.BUSOLA_SSL_CRT_FILE !== ''
) {
  const https = require('https');
  const options = {
    key: fs.readFileSync(process.env.BUSOLA_SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.BUSOLA_SSL_CRT_FILE),
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

const handleRequest = makeHandleRequest();

if (isDocker) {
  console.log('Running in dev mode');
  // yup, order matters here
  serveMonaco(app);
  app.use('/backend', handleRequest);
  serveStaticApp(app, '/', '/core-ui');
} else {
  console.log('Running in prod mode');
  handleTracking(app);
  app.use('/backend', handleRequest);
}

process.on('SIGINT', function() {
  process.exit();
});

server.listen(port, '0.0.0.0', address, () => {
  console.log(`Busola backend server started @ ${port}!`);
});
