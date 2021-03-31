const path = require('path');
const open = require('open');
const fs = require('fs');
const express = require('express');
import createEncoder from 'json-url';
import jsyaml from 'js-yaml';
let kubeconfig;

function setupNpx() {
  const location = process.env.KUBECONFIG || `${process.env.HOME}/.kube/config`;
  try {
    const data = fs.readFileSync(location, 'utf8');
    kubeconfig = jsyaml.load(data);
  } catch (e) {
    console.log(e);
  }
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
  try {
    const cluster = kubeconfig.clusters[0].cluster;
    const user = kubeconfig.users[0].user;
    const params = {
      cluster: {
        server: cluster.server,
        'certificate-authority-data': cluster['certificate-authority-data'],
      },
      rawAuth: {
        token: user.token,
        'client-certificate-data': user['client-certificate-data'],
        'client-key-data': user['client-key-data'],
      },
      config: {
        disabledNavigationNodes: '',
        systemNamespaces:
          'istio-system knative-eventing knative-serving kube-public kube-system kyma-backup kyma-installer kyma-integration kyma-system natss kube-node-lease kubernetes-dashboard serverless-system',
      },
      features: {
        bebEnabled: false,
      },
    };
    createEncoder('lzstring')
      .compress(params)
      .then(p => open(`http://localhost:${port}/home/?init=${p}`));
  } catch (_) {
    open(`http://localhost:${port}/login.html`);
  }
}

function isNpxEnv() {
  return true || process.env.NODE_ENV === 'npx';
}

function runIfNpx(fn) {
  return (...args) => {
    if (isNpxEnv()) {
      return fn(...args);
    }
  };
}

export default {
  setup: runIfNpx(setupNpx),
  setupRoutes: runIfNpx(setupRoutes),
  openBrowser: runIfNpx(openBrowser),
  isNpxEnv,
};
