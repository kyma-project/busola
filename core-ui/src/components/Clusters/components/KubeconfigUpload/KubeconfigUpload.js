import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import { KubeconfigTextArea } from './KubeconfigTextArea/KubeconfigTextArea';
import jsyaml from 'js-yaml';
import { ControlledEditor, useTheme } from 'react-shared';

export function KubeconfigUpload({
  onKubeconfig,
  handleKubeconfigAdded,
  kubeconfigFromParams,
}) {
  // const [showParseError, setShowParseError] = React.useState(false);
  const [error, setError] = React.useState('');
  const [kubeconfig, setKubeconfig] = React.useState('');
  const [kubeconfigs, setKubeconfigs] = React.useState({
    text: jsyaml.dump(kubeconfigFromParams),
  });
  const { editorTheme } = useTheme();
  const { t } = useTranslation();

  const updateKubeconfig = text => {
    try {
      jsyaml.load(text);
      setKubeconfig(text);
      setError(null);
      onKubeconfig(text);
    } catch ({ message }) {
      // get the message until the newline
      setError(message.substr(0, message.indexOf('\n')));
      onKubeconfig(null);
    }
    // const kubeconfig = parseKubeconfig(text);
    // setShowParseError(!kubeconfig);
    // setKubeconfigs({ ...kubeconfigs, [source]: kubeconfig });
    // // handleKubeconfigAdded(kubeconfig);
    // setKubeconfig(kubeconfig);
  };

  return (
    <>
      <KubeconfigFileUpload onKubeconfigTextAdded={updateKubeconfig} />
      {/*
      <p>or</p>
      <KubeconfigTextArea
        onKubeconfigTextAdded={onKubeconfigTextAdded('text')}
        kubeconfigFromParams={kubeconfigFromParams}
      />
      */}
      <ControlledEditor
        height="400px"
        language="yaml"
        theme={editorTheme}
        value={kubeconfig}
        onChange={(e, text) => updateKubeconfig(text)}
      />
      {/*showParseError && (
        <MessageStrip
          aria-label="invalid-kubeconfig"
          className="fd-margin-top--sm"
          type="error"
        >
          {t('clusters.messages.error-kubeconfig')}
        </MessageStrip>
      )*/}
      {error && (
        <MessageStrip type="error" className="fd-margin--sm">
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </>
  );
}
