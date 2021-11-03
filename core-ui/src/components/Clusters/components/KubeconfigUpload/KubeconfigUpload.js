import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import jsyaml from 'js-yaml';
import { ControlledEditor, useTheme } from 'react-shared';

import './KubeconfigUpload.scss';

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
      if (typeof config !== 'object') {
        setError(t('clusters.wizard.not-an-object'));
      } else {
        setKubeconfig(config);
        setError(null);
      }
    } catch ({ message }) {
      // get the message until the newline
      setError(message.substr(0, message.indexOf('\n')));
    }
  };

  return (
    <>
      <KubeconfigFileUpload onKubeconfigTextAdded={updateKubeconfig} />
      <p className="editor-label fd-margin-bottom--sm fd-margin-top--sm">
        {t('clusters.wizard.editor-label')}
      </p>
      <ControlledEditor
        height="400px"
        language="yaml"
        theme={editorTheme}
        value={configString}
        editorDidMount={(getValue, editor) =>
          editor.onDidBlurEditorWidget(() => updateKubeconfig(getValue()))
        }
        onChange={(_, value) => updateKubeconfig(value)}
      />
      {error && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </>
  );
}
