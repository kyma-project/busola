import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import jsyaml from 'js-yaml';
import { MonacoEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { useTheme } from 'shared/contexts/ThemeContext';

import './KubeconfigUpload.scss';

export function KubeconfigUpload({ setKubeconfig }) {
  const [error, setError] = React.useState('');
  const [editorValue, setEditorValue] = React.useState('');
  const { editorTheme } = useTheme();
  const { t } = useTranslation();

  const updateKubeconfig = text => {
    try {
      const config = jsyaml.load(text);
      if (typeof config !== 'object') {
        setError(t('clusters.wizard.not-an-object'));
      } else {
        setEditorValue(text);
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
        height="320px"
        language="yaml"
        theme={editorTheme}
        value={editorValue || ''}
        onMount={editor =>
          editor.onDidBlurEditorWidget(() =>
            updateKubeconfig(editor.getValue()),
          )
        }
        onChange={value => updateKubeconfig(value)}
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
