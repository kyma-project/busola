import React from 'react';
import { ControlledEditor, useTheme } from 'react-shared';
import jsyaml from 'js-yaml';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import './Editor.scss';

export function Editor({
  resource,
  setResource,
  readonly,
  language = 'yaml',
  ...props
}) {
  const { t } = useTranslation();
  const [error, setError] = React.useState('');
  const { editorTheme } = useTheme();
  // don't useState, as it's value needs to be referenced in onEditorBlur
  // using useState value in onEditorBlur results in stale closure
  const textResource = React.useRef(jsyaml.dump(resource, { noRefs: true }));
  const isEditing = React.useRef(false);

  React.useEffect(() => {
    if (!isEditing.current) {
      if (language === 'yaml') {
        textResource.current = jsyaml.dump(resource, { noRefs: true });
      } else if (language === 'json') {
        textResource.current = JSON.stringify(resource);
      }
    }
  }, [resource]);

  const handleChange = (_, text) => {
    textResource.current = text;
    try {
      const parsed = jsyaml.load(text);
      if (typeof parsed !== 'object' || !parsed) {
        setError(t('common.create-form.object-required'));
        return;
      }
      setResource(parsed);
      setError(null);
    } catch ({ message }) {
      // get the message until the newline
      setError(message.substr(0, message.indexOf('\n')));
    }
  };

  const options = {
    readOnly: readonly,
    minimap: {
      enabled: false,
    },
  };

  return (
    <div className="resource-form__editor">
      <ControlledEditor
        language={language}
        theme={editorTheme}
        value={textResource.current}
        onChange={handleChange}
        editorDidMount={(_, editor) => {
          editor.onDidFocusEditorText(() => (isEditing.current = true));
          editor.onDidBlurEditorText(() => (isEditing.current = false));
        }}
        options={options}
        {...props}
      />
      {error && (
        <div className="resource-form__editor__error">
          <MessageStrip type="error" className="fd-margin--sm">
            {t('common.create-form.editor-error', { error })}
          </MessageStrip>
        </div>
      )}
    </div>
  );
}
