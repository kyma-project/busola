import React from 'react';
import createEncoder from 'json-url';
import jsyaml from 'js-yaml';
import LuigiClient from '@luigi-project/client';
import { FileInput, DEFAULT_MODULES } from 'react-shared';
import { MessageStrip } from 'fundamental-react';
import { KubeconfigTextArea } from './KubeconfigTextArea/KubeconfigTextArea';
import { addCluster, readFile } from '../shared';

export function KubeconfigUpload({ setCluster, setShowingAuthForm }) {
  const [showError, setShowError] = React.useState(false);

  const initParams = LuigiClient.getNodeParams().init;

  const getConfigFromParams = async () => {
    if (!initParams) return {};
    const encoder = createEncoder('lzma');
    const decoded = await encoder.decompress(initParams);
    const systemNamespaces = decoded.config?.systemNamespaces;
    const systemNamespacesList = systemNamespaces
      ? systemNamespaces.split(' ')
      : [];
    const clusterConfig = {
      ...decoded?.config,
      systemNamespaces: systemNamespacesList,
      modules: { ...DEFAULT_MODULES, ...(decoded?.config?.modules || {}) },
    };
    return clusterConfig;
  };

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

  async function handleKubeconfigAdded(kubeconfig) {
    setShowingAuthForm(false);
    setShowError(false);

    const config = await getConfigFromParams();
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
        config,
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
      {initParams ? (
        <p>
          {' '}
          Configuration has been included properly but is missing Cluster and
          Auth data. Please upload a kubeconfig.{' '}
        </p>
      ) : (
        ''
      )}
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
        <MessageStrip className="fd-margin-top--sm" type="error">
          Error reading kubeconfig
        </MessageStrip>
      )}
    </>
  );
}
