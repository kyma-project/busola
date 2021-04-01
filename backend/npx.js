const path = require('path');
const open = require('open');
const fs = require('fs');
const express = require('express');
const http = require('http');

import createEncoder from 'json-url';
import jsyaml from 'js-yaml';
import { handleRequest } from './common';

function tryLoadKubeconfig() {
  const location = process.env.KUBECONFIG || `${process.env.HOME}/.kube/config`;
  try {
    const data = fs.readFileSync(location, 'utf8');
    return jsyaml.load(data);
  } catch (_) {}
  return null;
}

function buildInitParams(kubeconfig) {
  const cluster = kubeconfig.clusters[0].cluster;
  const user = kubeconfig.users[0].user;
  return {
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
}

function openBrowser(port) {
  try {
    const kubeconfig = tryLoadKubeconfig();
    const params = buildInitParams(kubeconfig);
    createEncoder('lzstring')
      .compress(params)
      .then(p => open(`http://localhost:${port}/home/?init=${p}`));
  } catch (_) {
    open(`http://localhost:${port}/login.html`);
  }
}

const app = express();
app.use(express.raw({ type: '*/*' }));

const server = http.createServer(app);
const port = process.env.PORT || 3001;

app.use('/core-ui', express.static(path.join(__dirname, 'core-ui')));
app.get('/core-ui/*', (_, res) =>
  res.sendFile(path.join(__dirname + '/core-ui/index.html')),
);

app.use('/backend', handleRequest);

app.use('/', express.static(path.join(__dirname, 'core')));
app.get('/*', (_, res) =>
  res.sendFile(path.join(__dirname + '/core/index.html')),
);

server.listen(port, 'localhost', () => {
  console.log(`Busola backend server started @ ${port}!`);
  openBrowser(port);
});
