import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import { KubeconfigTextArea } from './KubeconfigTextArea/KubeconfigTextArea';
import jsyaml from 'js-yaml';

export function KubeconfigUpload({
  handleKubeconfigAdded,
  kubeconfigFromParams,
}) {
  const [showParseError, setShowParseError] = React.useState(false);
  const [kubeconfigs, setKubeconfigs] = React.useState({
    text: jsyaml.dump(kubeconfigFromParams),
  });

  const parseKubeconfig = text => {
    try {
      const parsed = jsyaml.load(text);
      if (!parsed || typeof parsed !== 'object') {
        throw Error('Kubeconfig must be an object.');
      }
      return parsed;
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  const onKubeconfigTextAdded = source => text => {
    const kubeconfig = parseKubeconfig(text);
    setShowParseError(!kubeconfig);
    setKubeconfigs({ ...kubeconfigs, [source]: kubeconfig });
    handleKubeconfigAdded(kubeconfig);
  };

  return (
    <>
      <KubeconfigFileUpload
        onKubeconfigTextAdded={onKubeconfigTextAdded('upload')}
      />
      <p>or</p>
      <KubeconfigTextArea
        onKubeconfigTextAdded={onKubeconfigTextAdded('text')}
        kubeconfigFromParams={kubeconfigFromParams}
      />
      {showParseError && (
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
