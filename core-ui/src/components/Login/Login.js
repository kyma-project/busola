import React from 'react';
import { FileInput, PageHeader } from 'react-shared';
import { Panel, Alert } from 'fundamental-react';

import { AuthForm } from './AuthForm';
import { readKubeconfigFile } from './helpers';
import { saveInitParams } from './initParams';

export default function Login() {
  const [error, setError] = React.useState(null);
  const [cluster, setCluster] = React.useState(null);
  const [requireForm, setRequireForm] = React.useState(false);

  const onFileChange = file => {
    setError(null);
    setCluster(null);
    setRequireForm(false);
    readKubeconfigFile(file)
      .then(kk => {
        const cluster = {
          server: kk.clusters[0].cluster.server,
          'certificate-authority-data':
            kk.clusters[0].cluster['certificate-authority-data'],
        };
        const user = kk.users[0].user;
        const token = user.token;
        const clientCA = user['client-certificate-data'];
        const clientKeyData = user['client-key-data'];
        if (token || (clientCA && clientKeyData)) {
          saveInitParams({
            cluster,
            rawAuth: {
              idToken: token,
              'client-certificate-data': clientCA,
              'client-key-data': clientKeyData,
            },
          });
        } else {
          setCluster(cluster);
          setRequireForm(true);
        }
      })
      .catch(e => {
        console.warn(e);
        setError('Error reading kubeconfig.');
      });
  };

  return (
    <>
      <PageHeader
        title="Login to Busola"
        description="Login with your kubeconfig file"
      />
      <Panel className="fd-has-margin-m fd-has-padding-s">
        <FileInput
          fileInputChanged={onFileChange}
          acceptedFileFormats=".yml,.yaml"
          required={true}
        />
        {error && (
          <Alert className="fd-has-margin-top-s" type="error">
            {error}
          </Alert>
        )}
        {requireForm && (
          <AuthForm onSubmit={auth => saveInitParams({ cluster, auth })} />
        )}
      </Panel>
    </>
  );
}
