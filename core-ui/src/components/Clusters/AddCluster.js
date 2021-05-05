import React from 'react';
import LuigiClient from '@luigi-project/client';

import { PageHeader } from 'react-shared';
import { AuthForm } from './AuthForm';
import jsyaml from 'js-yaml';
import { addCluster, readFile } from './shared';

export function AddCluster() {
  const [showNoAuth, setShowNoAuth] = React.useState(false);
  const [cluster, setCluster] = React.useState(null);
  const [auth, setAuth] = React.useState({
    issuerUrl: 'https://apskyxzcl.accounts400.ondemand.com',
    clientId: 'd0316c58-b0fe-45cd-9960-0fea0708355a',
    scope: 'openid',
  });

  async function onKubeconfigUploaded(file) {
    try {
      const kubeconfigParsed = jsyaml.load(await readFile(file));
      handleKubeconfigAdded(kubeconfigParsed);
    } catch (e) {
      alert(e);
      console.warn(e);
    }
  }

  function handleKubeconfigAdded(kubeconfig) {
    const clusterName = kubeconfig.clusters[0].name;
    try {
      const cluster = {
        name: clusterName,
        server: kubeconfig.clusters[0].cluster.server,
        'certificate-authority-data':
          kubeconfig.clusters[0].cluster['certificate-authority-data'],
      };
      const user = kubeconfig.users[0].user;
      const token = user.token;
      const clientCA = user['client-certificate-data'];
      const clientKeyData = user['client-key-data'];
      if (token || (clientCA && clientKeyData)) {
        const params = {
          cluster,
          rawAuth: {
            idToken: token,
            'client-certificate-data': clientCA,
            'client-key-data': clientKeyData,
          },
        };
        addCluster(params);
      } else {
        setShowNoAuth(true);
        setCluster(cluster);
      }
    } catch (e) {
      alert(e);
      console.warn(e);
    }
  }

  function addClusterWithAuth() {
    const params = {
      cluster,
      auth: { ...auth, responseType: 'id_token' },
    };
    console.log(params);
    addCluster(params);
  }

  const breadcrumbItems = [
    { name: 'Clusters', path: '/clusters', fromAbsolutePath: true },
  ];

  return (
    <>
      <PageHeader title="Add Cluster" breadcrumbItems={breadcrumbItems} />
      <input
        type="file"
        onChange={e => onKubeconfigUploaded(e.target.files[0])}
      />
      {showNoAuth && (
        <AuthForm auth={auth} setAuth={setAuth} onSubmit={addClusterWithAuth} />
      )}
    </>
  );
}
