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
  kubeconfig,
  setKubeconfig,
}) {
  const [error, setError] = React.useState('');
  const { editorTheme } = useTheme();
  const { t } = useTranslation();

  const configString = jsyaml.dump(kubeconfig, { noRefs: true }) || undefined;

  const updateKubeconfig = text => {
    try {
      const config = jsyaml.load(text);
      setKubeconfig(config);
      setError(null);
    } catch ({ message }) {
      // get the message until the newline
      setError(message.substr(0, message.indexOf('\n')));
    }
  };

  const onEditorBlur = getValue => {
    updateKubeconfig(getValue());
  };

  return (
    <>
      <KubeconfigFileUpload onKubeconfigTextAdded={updateKubeconfig} />
      <ControlledEditor
        height="400px"
        language="yaml"
        theme={editorTheme}
        value={configString}
        // onChange={(e, text) => updateKubeconfig(text)}
        editorDidMount={(params, editor) =>
          editor.onDidBlurEditorWidget(() => onEditorBlur(params))
        }
      />
      {error && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </>
  );
}
