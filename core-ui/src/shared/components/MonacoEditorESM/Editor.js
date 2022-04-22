import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';
import jsyaml from 'js-yaml';
import { editor } from 'monaco-editor';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useAutocompleteWorker } from './useAutocompleteWorker';
import './Editor.scss';
import { Spinner } from 'shared/components/Spinner/Spinner';

export function Editor({
  value,
  setValue,
  readonly,
  language = 'yaml',
  editorDidMount,
  customSchemaId,
  autocompletionDisabled,
  customSchemaUri,
}) {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [markers, setMarkers] = useState([]);
  const { editorTheme } = useTheme();

  const divRef = useRef(null);
  const valueRef = useRef(jsyaml.dump(value, { noRefs: true }));
  const editorRef = useRef(null);
  const {
    setAutocompleteOptions,
    error: schemaError,
    loading,
  } = useAutocompleteWorker({
    value,
    customSchemaId,
    autocompletionDisabled,
    customSchemaUri,
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
    console.log(modelUri);
    const model = editor.createModel(valueRef.current, language, modelUri);
    editorRef.current = editor.create(divRef.current, {
      model: model,
      automaticLayout: true,
      language: 'yaml',
      fontSize: 15,
      theme: editorTheme,
      fixedOverflowWidgets: true,
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
    <div className="resource-form__wrapper">
      {loading ? (
        <div className="resource-form__overlay">
          <Spinner />
        </div>
      ) : null}

      <div ref={divRef} className="resource-form__editor" />

      {error && (
        <div className="resource-form__editor__error">
          <MessageStrip type="error" className="fd-margin--sm">
            {t('common.create-form.editor-error', { error })}
          </MessageStrip>
        </div>
      )}

      <div className="resource-form__legend">
        {schemaError ? (
          <p> {t('common.create-form.schema-error', { error: schemaError })}</p>
        ) : null}
        {markers.length ? (
          <div className="resource-form__editor__error">
            <MessageStrip type="info" className="fd-margin--sm">
              {markers.map(m => (
                <p>
                  {t('common.tooltips.line')} {m.startLineNumber},{' '}
                  {t('common.tooltips.column')} {m.startColumn}: {m.message}
                </p>
              ))}
            </MessageStrip>
          </div>
        ) : null}
      </div>
    </div>
  );
}
