/* global  require, process */
import { handleK8sRequests } from './kubernetes/handler';
import { proxyHandler, proxyRateLimiter } from './proxy.js';
import companionRouter from './companion/companionRouter';
import communityRouter from './modules/communityRouter';
import addLogger from './logging';
import { serveMonaco, serveStaticApp } from './statics';
//import { requestLogger } from './utils/other'; //uncomment this to log the outgoing traffic

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const config = require('./config.js');

const app = express();
app.disable('x-powered-by');
app.use(express.raw({ type: '*/*', limit: '100mb' }));

const gzipEnabled = config.features?.GZIP?.isEnabled;

if (gzipEnabled)
  app.use(
    compression({
      filter: (req, res) => {
        if (/\?.*follow=/.test(req.originalUrl)) {
          // compression interferes with ReadableStreams. Small chunks are not transmitted for unknown reason
          return false;
        }
        // Skip compression for streaming endpoint
        if (req.originalUrl.startsWith('/backend/ai-chat/messages')) {
          return false;
        }
        // fallback to standard filter function
        return compression.filter(req, res);
      },
    }),
  );

if (process.env.NODE_ENV === 'development') {
  console.log('Use development settings of cors');
  app.use(cors({ origin: '*' }));
}

app.use('/proxy', proxyRateLimiter, proxyHandler);

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

const handleRequest = addLogger(handleK8sRequests);

if (isDocker) {
  // Running in dev mode
  // yup, order matters here
  serveMonaco(app);
  app.use('/backend/ai-chat', companionRouter);
  app.use('/backend/modules', communityRouter);
  app.use('/backend', handleRequest);
  serveStaticApp(app, '/', '/core-ui');
} else {
  // Running in prod mode
  app.use('/backend/ai-chat', companionRouter);
  app.use('/backend/modules', communityRouter);
  app.use('/backend', handleRequest);
}

process.on('SIGINT', function () {
  process.exit();
});

server.listen(port, '0.0.0.0', address, () => {
  console.log(`Busola backend server started @ ${port}!`);
});
