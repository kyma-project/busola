import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { ControlledEditor, useTheme } from 'react-shared';
import jsyaml from 'js-yaml';

import { YamlFileUpload } from './YamlFileUpload';

export function YamlUpload({ yamlContent, setYamlContent }) {
  const [error, setError] = React.useState('');
  const { editorTheme } = useTheme();
  const { t } = useTranslation();

  const yamlContentString = yamlContent
    ?.map(y => jsyaml.dump(y, { noRefs: true }) || undefined)
    ?.join('---\n');

  const isK8sResource = resource => {
    if (!resource) return true;
    return resource.apiVersion && resource.kind && resource.metadata;
  };
  const updateYamlContent = text => {
    try {
      const files = jsyaml.loadAll(text);
      if (files.some(file => typeof file !== 'object')) {
        setError(t('clusters.wizard.not-an-object'));
      } else if (files.some(file => !isK8sResource(file))) {
        setError('Not a k8s resource!');
      } else {
        setYamlContent(files);
        setError(null);
      }
    } catch ({ message }) {
      // get the message until the newline
      setError(message.substr(0, message.indexOf('\n')));
    }
  };

  return (
    <>
      <YamlFileUpload onYamlContentAdded={updateYamlContent} />
      <p className="editor-label fd-margin-bottom--sm fd-margin-top--sm">
        or paste it here:
      </p>
      <ControlledEditor
        height="400px"
        language="yaml"
        theme={editorTheme}
        value={yamlContentString}
        editorDidMount={(getValue, editor) =>
          editor.onDidBlurEditorWidget(() => updateYamlContent(getValue()))
        }
        onChange={(_, value) => updateYamlContent(value)}
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
