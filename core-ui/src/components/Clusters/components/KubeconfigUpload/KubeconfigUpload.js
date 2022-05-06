import React, { useCallback, useState } from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import jsyaml from 'js-yaml';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';

import './KubeconfigUpload.scss';

export function KubeconfigUpload({
  onKubeconfig,
  handleKubeconfigAdded,
  kubeconfigFromParams,
  kubeconfig,
  setKubeconfig,
}) {
  const [error, setError] = React.useState('');
  const [editor, setEditor] = useState(null);

  const { t } = useTranslation();

  const updateKubeconfig = useCallback(
    text => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );
  return (
    <>
      <KubeconfigFileUpload
        onKubeconfigTextAdded={text => {
          editor.getModel().setValue(text);
        }}
      />
      <p className="editor-label fd-margin-bottom--sm fd-margin-top--sm">
        {t('clusters.wizard.editor-label')}
      </p>
      <Editor
        height="320px"
        autocompletionDisabled
        language="yaml"
        value={jsyaml.dump(kubeconfig)}
        customSchemaId="cluster"
        onMount={setEditor}
        onChange={updateKubeconfig}
      />
      {error && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </>
  );
}
