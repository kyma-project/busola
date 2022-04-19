import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';
import jsyaml from 'js-yaml';
import { editor } from 'monaco-editor';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useEditorHelper } from './useEditorHelper';

import './Editor.scss';

export function Editor({
  value,
  setValue,
  readonly,
  language = 'yaml',
  editorDidMount,
  ...props
}) {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [markers, setMarkers] = useState([]);
  const { editorTheme } = useTheme();

  const divRef = useRef(null);
  const valueRef = useRef(jsyaml.dump(value, { noRefs: true }));
  const editorRef = useRef(null);
  const { setAutocompleteOptions } = useEditorHelper({
    ...props,
  });
  useEffect(() => {
    editor.onDidChangeMarkers(markers => {
      if (markers.length) {
        const descriptiveMarkers = editor.getModelMarkers({});
        setMarkers(descriptiveMarkers);
      }
    });
  }, [setMarkers]);

  useEffect(() => {
    const { modelUri } = setAutocompleteOptions();

    const model = editor.createModel(valueRef.current, language, modelUri);
    editorRef.current = editor.create(divRef.current, {
      model: model,
      automaticLayout: true,
      language: 'yaml',
      fontSize: 15,
      theme: editorTheme,
    });

    editorRef.current.onDidChangeModelContent(() => {
      const editorValue = editorRef.current.getValue();

      if (valueRef.current !== editorValue) {
        try {
          let parsed = {};
          if (language === 'yaml') {
            parsed = jsyaml.load(editorValue);
          } else if (language === 'json') {
            parsed = JSON.parse(editorValue);
          }
          if (typeof parsed !== 'object') {
            setError(t('common.create-form.object-required'));
            return;
          }
          setValue(parsed);
          setError(null);
        } catch ({ message }) {
          // get the message until the newline
          setError(message.substr(0, message.indexOf('\n')));
        }
      }
    });
    return () => {
      editor.getModels().forEach(model => {
        if (model._associatedResource === modelUri) model.dispose();
      });
      editorRef.current.dispose();
    };
  }, [editorTheme, setAutocompleteOptions, language, setValue, t]);

  return (
    <div>
      <div
        ref={divRef}
        style={{ width: 800, height: 300, border: '1px solid #d9d9d9' }}
      />

      {error && (
        <div className="resource-form__editor__error">
          <MessageStrip type="error" className="fd-margin--sm">
            {t('common.create-form.editor-error', { error })}
          </MessageStrip>
        </div>
      )}
      <div>{JSON.stringify(markers)}</div>
    </div>
  );
}
