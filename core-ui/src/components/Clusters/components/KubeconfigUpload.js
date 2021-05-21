import React from 'react';
import jsyaml from 'js-yaml';
import { FileInput } from 'react-shared';
import { MessageStrip } from 'fundamental-react';
import { KubeconfigTextArea } from './KubeconfigTextArea/KubeconfigTextArea';
import { addCluster, readFile } from '../shared';

export function KubeconfigUpload({ setCluster, setShowingAuthForm }) {
  const [showError, setShowError] = React.useState(false);

  async function onKubeconfigUploaded(file) {
    setShowError(false);
    try {
      const kubeconfigParsed = jsyaml.load(await readFile(file));
      handleKubeconfigAdded(kubeconfigParsed);
    } catch (e) {
      setShowError(true);
      console.warn(e);
    }
  }

  function handleKubeconfigAdded(kubeconfig) {
    setShowingAuthForm(false);
    setShowError(false);

    const clusterName = kubeconfig.clusters[0].name;
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
      setShowingAuthForm(true);
      setCluster(cluster);
    }
  }

  return (
    <>
      <FileInput
        fileInputChanged={onKubeconfigUploaded}
        acceptedFileFormats=".yaml"
      />
      <p>or</p>
      <KubeconfigTextArea
        onSubmit={handleKubeconfigAdded}
        setShowError={setShowError}
      />
      {showError && (
        <MessageStrip
          aria-label="invalid-kubeconfig"
          className="fd-margin-top--sm"
          type="error"
        >
          Error reading kubeconfig
        </MessageStrip>
      )}
    </>
  );
}
