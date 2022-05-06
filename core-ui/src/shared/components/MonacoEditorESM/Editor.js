import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';
import jsyaml from 'js-yaml';
import { editor, Uri } from 'monaco-editor';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useAutocompleteWorker } from './useAutocompleteWorker';
import { Spinner } from 'shared/components/Spinner/Spinner';
import './Editor.scss';

export function Editor({
  value,
  setValue,
  readOnly,
  language = 'yaml',
  onMount,
  customSchemaId,
  autocompletionDisabled,
  customSchemaUri,
  height,
}) {
  const descriptor = useRef(Uri);
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [markers, setMarkers] = useState([]);
  const { editorTheme } = useTheme();

  const divRef = useRef(null);
  const valueRef = useRef(jsyaml.dump(value, { noRefs: true }));
  const editorRef = useRef(null);
  const {
    setAutocompleteOptions,
    activeSchemaPath,
    error: schemaError,
    loading,
  } = useAutocompleteWorker({
    value,
    customSchemaId,
    autocompletionDisabled,
    customSchemaUri,
    readOnly,
  });
  useEffect(() => {
    const onDidChangeMarkers = editor.onDidChangeMarkers(markers => {
      if (markers.length) {
        const descriptiveMarkers = editor.getModelMarkers({
          resource: descriptor.current,
        });
        setMarkers(descriptiveMarkers);
      }
    });

    return () => {
      onDidChangeMarkers.dispose();
    };
  }, [setMarkers]);

  useEffect(() => {
    const { modelUri } = setAutocompleteOptions();

    descriptor.current = modelUri;
    const model =
      editor.getModel(modelUri) ||
      editor.createModel(valueRef.current, language, modelUri);

    editorRef.current = editor.create(divRef.current, {
      model: model,
      automaticLayout: true,
      language: 'yaml',
      fontSize: 15,
      theme: editorTheme,
      fixedOverflowWidgets: true,
      readOnly: readOnly,
    });

    if (typeof onMount === 'function') {
      onMount(editorRef.current);
    }

    const onDidChangeModelContent = editorRef.current.onDidChangeModelContent(
      () => {
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
      },
    );

    return () => {
      onDidChangeModelContent.dispose();

      editor.getModel(descriptor.current).dispose();
      editorRef.current.dispose();
    };
  }, [
    editorTheme,
    setAutocompleteOptions,
    language,
    setValue,
    t,
    readOnly,
    onMount,
  ]);

  useEffect(() => {
    const onDidFocusEditorText = editorRef.current.onDidFocusEditorText(() => {
      if (activeSchemaPath !== descriptor.current.path) {
        setAutocompleteOptions();
      }
    });

    return () => {
      onDidFocusEditorText.dispose();
    };
  }, [setAutocompleteOptions, activeSchemaPath]);

  return (
    <div
      className="resource-form__wrapper"
      style={{ height, minHeight: height }}
    >
      {loading ? (
        <div className="resource-form__overlay">
          <Spinner />
        </div>
      ) : null}
      <div ref={divRef} className="resource-form__editor" />
      <div className="resource-form__legend">
        {error && (
          <MessageStrip type="error" className="fd-margin--sm">
            {t('common.create-form.editor-error', { error })}
          </MessageStrip>
        )}
        {schemaError && (
          <MessageStrip type="warning" className="fd-margin--sm" dismissible>
            {t('common.create-form.autocomplete-unavailable-error', {
              error: schemaError,
            })}
          </MessageStrip>
        )}
        {markers.length ? (
          <div>
            <MessageStrip type="warning" className="fd-margin--sm">
              {markers.map(m => (
                <span
                  className="line"
                  key={`${m.startLineNumber}${m.startColumn}`}
                >
                  {t('common.tooltips.line')} {m.startLineNumber},{' '}
                  {t('common.tooltips.column')} {m.startColumn}: {m.message}
                </span>
              ))}
            </MessageStrip>
          </div>
        ) : null}
      </div>
    </div>
  );
}
