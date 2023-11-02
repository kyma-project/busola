import React, { useCallback, useState } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
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
    [t, setError, setKubeconfig],
  );

  return (
    <div className="kubeconfig-upload">
      <KubeconfigFileUpload
        onKubeconfigTextAdded={text => {
          editor.getModel().setValue(text);
        }}
      />
      <p className="editor-label bsl-margin-bottom--sm bsl-margin-top--sm">
        {t('clusters.wizard.editor-label')}
      </p>
      <Editor
        autocompletionDisabled
        language="yaml"
        value={kubeconfig ? jsyaml.dump(kubeconfig) : ''}
        onMount={setEditor}
        onChange={updateKubeconfig}
      />
      {error && (
        <MessageStrip
          design="Negative"
          hideCloseButton
          className="bsl-margin-top--sm"
        >
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </div>
  );
}
