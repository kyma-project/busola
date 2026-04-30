/* global  require, process, __dirname */
import { handleK8sRequests } from './kubernetes/handler';
import { proxyHandler, proxyRateLimiter } from './proxy.js';
import rateLimit from 'express-rate-limit';
import companionRouter from './companion/companionRouter';
import communityRouter from './modules/communityRouter';
import { pinoMiddleware, createSlowRequestLogger } from './logging';
import { serveMonaco, serveStaticApp } from './statics';
import crypto from 'crypto';
import { fillActiveEnvForFrontend } from './utils/active-env';

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');

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

const SLOW_REQUEST_THRESHOLD_MS = parseInt(
  process.env.SLOW_REQUEST_THRESHOLD_MS || '4000',
  10,
);
app.use(createSlowRequestLogger(SLOW_REQUEST_THRESHOLD_MS));

app.use('/proxy', proxyRateLimiter, proxyHandler);

const kubeconfigRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/backend/kubeconfig', kubeconfigRateLimiter, (req, res) => {
  const kubeconfigDir = path.join(
    __dirname,
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

const port = process.env.PORT || 3001;
const address = process.env.ADDRESS || 'localhost';
const isDocker = process.env.IS_DOCKER === 'true';

// TEMPORARY: proxy/IP topology diagnostic — remove after investigation
app.get('/backend/_diagnostic-ip', (req, res) => {
  const xff = req.headers['x-forwarded-for'] || '';
  const xffEntries = xff
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const info = {
    reqIp: req.ip,
    reqIps: req.ips,
    socketRemoteAddress: req.socket?.remoteAddress,
    xForwardedFor: xff,
    xForwardedForEntries: xffEntries,
    xForwardedForCount: xffEntries.length,
    xForwardedProto: req.headers['x-forwarded-proto'] || null,
    xForwardedHost: req.headers['x-forwarded-host'] || null,
    xRealIp: req.headers['x-real-ip'] || null,
    via: req.headers['via'] || null,
    forwarded: req.headers['forwarded'] || null,
    trustProxySetting: app.get('trust proxy'),
  };
  req.log.info(info, 'ip-diagnostic');
  res.json(info);
});

if (isDocker) {
  // Running in dev mode
  // yup, order matters here
  serveMonaco(app);
  app.use('/backend/ai-chat', companionRouter);
  app.use('/backend/modules', communityRouter);
  app.use('/backend', handleK8sRequests);
  serveStaticApp(app, '/', '/core-ui');
} else {
  // Running in prod mode
  app.use('/backend/ai-chat', companionRouter);
  app.use('/backend/modules', communityRouter);
  app.use('/backend', handleK8sRequests);
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
