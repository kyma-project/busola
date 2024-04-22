import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from 'shared/components/MonacoEditorESM/Editor';
import jsyaml from 'js-yaml';

import { YamlFileUploader } from './YamlFileUploader';
import { OPERATION_STATE_INITIAL } from './YamlUploadDialog';
import { spacing } from '@ui5/webcomponents-react-base';
import { FlexBox } from '@ui5/webcomponents-react';

const isK8sResource = resource => {
  if (!resource) return true;
  return resource.apiVersion && resource.kind && resource.metadata;
};

function YamlUpload({
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

  useEffect(() => {
    if (!yamlContentString && editor) editor.getModel().setValue('');
  }, [editor, yamlContentString]);

  const updateYamlContent = useCallback(
    text => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setLastOperationState, t],
  );

  return (
    <FlexBox
      style={{
        gap: '1rem',
        // when using solution from: https://github.com/microsoft/monaco-editor/issues/3393
        // the Monaco is able to decrease it's size after enlarging
        minWidth: 0, // https://github.com/microsoft/monaco-editor/issues/3393
        minHeight: 0,
        ...spacing.sapUiSmallMarginEnd,
      }}
      direction={'Column'}
    >
      <YamlFileUploader
        onYamlContentAdded={val => {
          updateYamlContent(val);
          editor.getModel().setValue(val);
        }}
      />
      <p style={spacing.sapUiTinyMargin}>{t('upload-yaml.or-paste-here')}</p>
      <div
        className={'yaml-upload-modal__content'}
        style={{
          padding: '0.5rem',
          height: '100%',
        }}
      >
        <Editor
          autocompletionDisabled
          language="yaml"
          value={yamlContentString ?? ''}
          onChange={updateYamlContent}
          onMount={setEditor}
          error={error}
        />
      </div>
    </FlexBox>
  );
}

export default YamlUpload;
