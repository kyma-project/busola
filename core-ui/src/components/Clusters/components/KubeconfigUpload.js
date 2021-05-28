import React from 'react';
import jsyaml from 'js-yaml';
import LuigiClient from '@luigi-project/client';
import { FileInput } from 'react-shared';
import { MessageStrip } from 'fundamental-react';
import { KubeconfigTextArea } from './KubeconfigTextArea/KubeconfigTextArea';
import { addCluster, readFile } from '../shared';
import { decompress, getConfigFromParams } from './getConfigFromParams';

export function KubeconfigUpload({ setKubeconfig, setShowingAuthForm }) {
  const [showError, setShowError] = React.useState(false);

  const initParams = LuigiClient.getNodeParams().init;

  React.useEffect(() => {
    if (!initParams) return;
    async function setKubeconfigIfPresentInParams() {
      const params = await decompress(initParams);
      if (params.kubeconfig) {
        handleKubeconfigAdded(params.kubeconfig);
      }
    }
    setKubeconfigIfPresentInParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initParams]);

  async function onKubeconfigUploaded(file) {
    setShowError(false);
    try {
      const kubeconfigParsed = jsyaml.load(await readFile(file));
      await handleKubeconfigAdded(kubeconfigParsed);
    } catch (e) {
      setShowError(true);
      console.warn(e);
    }
  }

  async function handleKubeconfigAdded(kubeconfig) {
    setShowingAuthForm(false);
    setShowError(false);

    const user = kubeconfig.users[0].user;
    const token = user.token;
    const clientCA = user['client-certificate-data'];
    const clientKeyData = user['client-key-data'];
    if (token || (clientCA && clientKeyData)) {
      const config = await getConfigFromParams(initParams);
      const params = {
        kubeconfig,
        config,
      };
      addCluster(params);
    } else {
      setShowingAuthForm(true);
      setKubeconfig(kubeconfig);
    }
  }

  return (
    <>
      {initParams ? (
        <p>
          Configuration has been included properly but is missing the
          kubeconfig. Please add one.
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
