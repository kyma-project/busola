import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import jsyaml from 'js-yaml';
import { MonacoEditor, useTheme } from 'react-shared';

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
      <MonacoEditor
        height="400px"
        language="yaml"
        theme={editorTheme}
        value={configString}
        onMount={editor =>
          editor.onDidBlurEditorWidget(() =>
            updateKubeconfig(editor.getValue()),
          )
        }
        onChange={(_, value) => updateKubeconfig(value)}
        options={{
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
      {error && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </>
  );
}
