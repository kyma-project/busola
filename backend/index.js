import {
  handleK8sRequests,
  k8sRateLimiter,
  requireK8sCredential,
} from './kubernetes/handler.js';
// Enable after: https://github.com/kyma-project/busola/issues/5299
// import { proxyHandler } from './proxy.js';
import { setupJWTCheck } from './jwtCheck.js';
import companionRouter from './companion/companionRouter.js';
import communityRouter from './modules/communityRouter.js';
import oidcDiscoveryRouter from './modules/oidcDiscoveryRouter.js';
import { createSlowRequestLogger, pinoMiddleware } from './logging/index.js';
import { serveMonaco, serveStaticApp } from './statics.js';
import crypto from 'crypto';
import config from './src/config/config.js';

import { fillActiveEnvForFrontend } from './utils/active-env.js';
import registerWebSocket from './src/terminal/handler.js';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const app = express();
app.disable('x-powered-by');
app.use(express.raw({ type: '*/*', limit: '100mb' }));

console.log('FIPS enabled: ', crypto.getFips() === 1);

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

if (process.env.ENVIRONMENT) {
  fillActiveEnvForFrontend(process.env.ENVIRONMENT);
}

if (process.env.NODE_ENV === 'development') {
  console.log('Use development settings of cors');
  app.use(cors({ origin: '*' }));
}

// Add Pino logging middleware (attaches req.log to all requests)
app.use(pinoMiddleware);

setupJWTCheck(app);

const SLOW_REQUEST_THRESHOLD_MS = parseInt(
  process.env.SLOW_REQUEST_THRESHOLD_MS || '4000',
  10,
);
app.use(createSlowRequestLogger(SLOW_REQUEST_THRESHOLD_MS));

// Enable after: https://github.com/kyma-project/busola/issues/5299
// app.use('/proxy', proxyHandler);

app.get('/backend/kubeconfig', (req, res) => {
  const kubeconfigDir = path.join(
    import.meta.dirname,
    process.env.IS_DOCKER ? '/core-ui/kubeconfig' : '../public/kubeconfig',
  );
  fs.readdir(kubeconfigDir, (err, files) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read kubeconfig directory' });
      return;
    }
    const yamlFiles = files.filter(
      (f) => f.endsWith('.yaml') || f.endsWith('.yml'),
    );
    res.json(yamlFiles);
  });
});

let server = null;

if (
  process.env.BUSOLA_SSL_ENABLED === '1' &&
  process.env.BUSOLA_SSL_KEY_FILE !== '' &&
  process.env.BUSOLA_SSL_CRT_FILE !== ''
) {
  const options = {
    key: fs.readFileSync(process.env.BUSOLA_SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.BUSOLA_SSL_CRT_FILE),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const port = process.env.PORT || 3001;
const address = process.env.ADDRESS || 'localhost';
const isDocker = process.env.IS_DOCKER === 'true';

if (isDocker) {
  // Running in dev mode
  // yup, order matters here
  serveMonaco(app);
  app.use('/backend/ai-chat', companionRouter);
  app.use('/backend', oidcDiscoveryRouter);
  app.use('/backend/modules', requireK8sCredential, communityRouter);
  app.use('/backend', requireK8sCredential, k8sRateLimiter, handleK8sRequests);
  serveStaticApp(app, '/', '/core-ui');
} else {
  // Running in prod mode
  app.use('/backend/ai-chat', companionRouter);
  app.use('/backend', oidcDiscoveryRouter);
  app.use('/backend/modules', requireK8sCredential, communityRouter);
  app.use('/backend', requireK8sCredential, k8sRateLimiter, handleK8sRequests);
}

if (config.features?.TERMINAL?.isEnabled) {
  registerWebSocket(server);
}

process.on('SIGINT', function () {
  console.log('SIGINT received, cleaning up...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', function () {
  console.log('SIGTERM received, cleaning up...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

server.listen(port, '0.0.0.0', address, () => {
  console.log(`Busola backend server started @ ${port}!`);
});
