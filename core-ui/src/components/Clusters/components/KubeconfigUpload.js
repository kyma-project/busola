import React, { useMemo } from 'react';
import createEncoder from 'json-url';
import jsyaml from 'js-yaml';
import LuigiClient from '@luigi-project/client';
import { FileInput, DEFAULT_MODULES } from 'react-shared';
import { MessageStrip } from 'fundamental-react';
import { KubeconfigTextArea } from './KubeconfigTextArea/KubeconfigTextArea';
import { addCluster, readFile } from '../shared';

export function KubeconfigUpload({ setCluster, setShowingAuthForm }) {
  console.log('KubeconfigUpload');
  const [showError, setShowError] = React.useState(false);
  const [config, setConfig] = React.useState({});

  const initParams = LuigiClient.getNodeParams().init;

  useMemo(() => {
    let isHookMounted = true;
    if (initParams && isHookMounted) {
      console.log('1', initParams);
      const getConfigFromParams = async () => {
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
        setConfig(clusterConfig);
      };

      getConfigFromParams();
    }
    return () => {
      isHookMounted = false;
    };
  }, []);

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
      {!(config && Object.keys(config).length === 0) ? (
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
