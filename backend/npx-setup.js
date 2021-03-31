const path = require('path');
const open = require('open');
const express = require('express');

function getKubeconfigPath() {
  return `${process.env.HOME}/.kube/config`;
}

function setupRoutes(app, handleBackendRequest) {
  app.use('/core-ui', express.static(path.join(__dirname, 'core-ui')));
  app.get('/core-ui/*', (_, res) =>
    res.sendFile(path.join(__dirname + '/core-ui/index.html')),
  );

  app.use('/backend', handleBackendRequest);

  app.use('/', express.static(path.join(__dirname, 'core')));
  app.get('/*', (_, res) =>
    res.sendFile(path.join(__dirname + '/core/index.html')),
  );
}

function openBrowser(port) {
  open(`http://localhost:${port}/`);
}

function adjustRequestOptions(options, kubeconfig) {
  kubeconfig.applyToRequest(options);
}

function isNpxEnv() {
  return process.env.NODE_ENV === 'npx';
}

function runIfNpx(fn) {
  return (...args) => {
    if (isNpxEnv()) {
      return fn(...args);
    }
  };
}

export default {
  getKubeconfigPath: runIfNpx(getKubeconfigPath),
  setupRoutes: runIfNpx(setupRoutes),
  openBrowser: runIfNpx(openBrowser),
  adjustRequestOptions: runIfNpx(adjustRequestOptions),
  isNpxEnv,
};
