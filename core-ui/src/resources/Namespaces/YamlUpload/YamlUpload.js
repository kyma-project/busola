import React, { useCallback, useState } from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import jsyaml from 'js-yaml';

import { YamlFileUploader } from './YamlFileUploader';
import { OPERATION_STATE_INITIAL } from './YamlUploadDialog';

const isK8sResource = resource => {
  if (!resource) return true;
  return resource.apiVersion && resource.kind && resource.metadata;
};

export function YamlUpload({
  resourcesData,
  setResourcesData,
  setLastOperationState,
}) {
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null);
  const { t } = useTranslation();
  const yamlContentString = resourcesData
    ?.map(y => jsyaml.dump(y, { noRefs: true }) || undefined)
    ?.join('---\n');

  const updateYamlContent = useCallback(
    files => {
      try {
        setLastOperationState(OPERATION_STATE_INITIAL);
        if (files.some(file => typeof file !== 'object')) {
          setError(t('clusters.wizard.not-an-object'));
        } else if (files.some(file => !isK8sResource(file))) {
          setError(t('upload-yaml.messages.not-a-k8s-resource'));
        } else {
          setResourcesData(files);
          setError(null);
        }
      } catch ({ message }) {
        // get the message until the newline
        setError(message.substr(0, message.indexOf('\n')));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setLastOperationState, t],
  );

  return (
    <div>
      <YamlFileUploader
        onYamlContentAdded={val => {
          updateYamlContent(val);
          editor.getModel().setValue(val);
        }}
      />
      <p className="editor-label fd-margin-bottom--sm fd-margin-top--sm">
        {t('upload-yaml.or-paste-here')}
      </p>
      <Editor
        autocompletionDisabled
        multipleYamls
        height="400px"
        language="yaml"
        value={yamlContentString}
        onChange={updateYamlContent}
        onMount={setEditor}
      />
      {error && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </div>
  );
}
