import React, { useState } from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { MonacoEditor, useTheme } from 'react-shared';
import jsyaml from 'js-yaml';

import { YamlFileUploader } from './YamlFileUploader';
import { OPERATION_STATE_INITIAL } from './YamlUploadDialog';

export function YamlUpload({
  resourcesData,
  setResourcesData,
  setLastOperationState,
}) {
  const [error, setError] = useState('');
  const { editorTheme } = useTheme();
  const { t } = useTranslation();

  const yamlContentString = resourcesData
    ?.map(y => jsyaml.dump(y, { noRefs: true }) || undefined)
    ?.join('---\n');

  const isK8sResource = resource => {
    if (!resource) return true;
    return resource.apiVersion && resource.kind && resource.metadata;
  };

  const updateYamlContent = text => {
    try {
      const files = jsyaml.loadAll(text);
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
  };

  return (
    <div>
      <YamlFileUploader onYamlContentAdded={updateYamlContent} />
      <p className="editor-label fd-margin-bottom--sm fd-margin-top--sm">
        {t('upload-yaml.or-paste-here')}
      </p>
      <MonacoEditor
        height="400px"
        language="yaml"
        theme={editorTheme}
        value={yamlContentString}
        onChange={updateYamlContent}
        options={{ scrollbar: { alwaysConsumeMouseWheel: false } }}
      />
      {error && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('common.create-form.editor-error', { error })}
        </MessageStrip>
      )}
    </div>
  );
}
