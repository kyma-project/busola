import React from 'react';
import { MonacoEditor } from 'shared/components/MonacoEditor/MonacoEditor';
import { useTheme } from 'shared/contexts/ThemeContext';
import jsyaml from 'js-yaml';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { Editor as EditorESM } from 'shared/components/MonacoEditorESM/Editor';
import Luigi from '@luigi-project/client';
import './Editor.scss';

function EditorUMD({
  value,
  setValue,
  readonly,
  language = 'yaml',
  onMount,
  ...props
}) {
  const { t } = useTranslation();
  const [error, setError] = React.useState('');
  const { editorTheme } = useTheme();
  // don't useState, as it's value needs to be referenced in onEditorBlur
  // using useState value in onEditorBlur results in stale closure
  const textResource = React.useRef(jsyaml.dump(value, { noRefs: true }));
  const isEditing = React.useRef(false);

  const prevValue = React.useRef(null);
  const parsedValue = React.useMemo(() => {
    if (!isEditing.current) {
      if (language === 'yaml') {
        prevValue.current = jsyaml.dump(value, { noRefs: true });
        return jsyaml.dump(value, { noRefs: true });
      } else if (language === 'json') {
        prevValue.current = JSON.stringify(value);
        return JSON.stringify(value);
      }
    }
  }, [value, language]);

  const handleChange = text => {
    textResource.current = text;
    try {
      let parsed = {};
      if (language === 'yaml') {
        parsed = jsyaml.load(text);
      } else if (language === 'json') {
        parsed = JSON.parse(text);
      }
      if (typeof parsed !== 'object' || !parsed) {
        setError(t('common.create-form.object-required'));
        return;
      }
      setValue(parsed);
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
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
  };
  return (
    <div className="resource-form__editor">
      <MonacoEditor
        language={language}
        theme={editorTheme}
        value={parsedValue || prevValue.current}
        onChange={handleChange}
        onMount={editor => {
          if (onMount) onMount(editor);
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

const isESM = Luigi.getContext().features?.MONACO_AUTOCOMPLETION?.isEnabled;
export const Editor = isESM ? EditorESM : EditorUMD;
