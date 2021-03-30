import React from 'react';
import { Button } from 'fundamental-react';
import { FileInput, TextFormItem } from 'react-shared';

import jsyaml from 'js-yaml';

export function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
  });
}

export default function Login() {
  const [error, setError] = React.useState(null);
  const [cluster, setCluster] = React.useState(null);
  const [token, setToken] = React.useState(null);
  const [auth, setAuth] = React.useState({
    issuerUrl: '',
    clientId: '',
    scope: 'openid',
    usePKCE: false,
  });

  const onFileChange = file => {
    setError(null);
    setCluster(null);
    setToken(null);
    readFile(file)
      .then(jsyaml.safeLoad)
      .then(kk => {
        setCluster({
          server: kk.clusters[0].cluster.server,
          'certificate-authority-data':
            kk.clusters[0].cluster['certificate-authority-data'],
        });
        setToken(kk.users[0].user.token);
      })
      .catch(e => {
        console.warn(e);
        setError('BAD KUBECONFIG DUDE');
      });
  };

  const submit = e => {
    e.preventDefault();
  };

  return (
    <>
      <FileInput
        fileInputChanged={onFileChange}
        acceptedFileFormats=".yml,.yaml"
        required={true}
      />
      {error && <p>{error}</p>}
      {cluster && !token && (
        <form onSubmit={submit}>
          <TextFormItem
            inputKey="issuer-url"
            required
            label="Issuer URL"
            placeholder="Enter issuer URL"
            onChange={e => setAuth({ ...auth, issuerUrl: e.target.value })}
          />
          <TextFormItem
            inputKey="client-id"
            required
            label="Client ID"
            placeholder="Enter client ID"
            onChange={e => setAuth({ ...auth, clientId: e.target.value })}
          />
          <Button disabled={!auth.issuerUrl || !auth.clientId}>Connect</Button>
        </form>
      )}
    </>
  );
}
