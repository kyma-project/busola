import React from 'react';
import { FileInput } from 'react-shared';

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
          server: kk.clusters[0].cluster.server.replace('https://', ''),
          'certificate-authority-data':
            kk.clusters[0].cluster['certificate-authority-data'],
        };
        const token = kk.users[0].user.token;
        if (token) {
          saveInitParams({ cluster, token });
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
      <FileInput
        fileInputChanged={onFileChange}
        acceptedFileFormats=".yml,.yaml"
        required={true}
      />
      {error && <p>{error}</p>}
      {requireForm && (
        <AuthForm onSubmit={auth => saveInitParams({ cluster, auth })} />
      )}
    </>
  );
}
