import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';
import jsyaml from 'js-yaml';
import { editor, Uri } from 'monaco-editor';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useAutocompleteWorker } from './useAutocompleteWorker';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { isEqual } from 'lodash';

import './Editor.scss';

export function Editor({
  value, // object for yaml and string for other formats. Editor call js-yaml functions itself.
  setValue,
  readOnly,
  language = 'yaml',
  multipleYamls, // set to true, if you want upload multiple yaml files
  onMount,
  customSchemaId, // custom key to find the json schema, don't use if the default key works (apiVersion/kind)
  autocompletionDisabled,
  customSchemaUri, // custom link to be displayed in the autocompletion tooltips
  height,
  options = {}, // IEditorOptions, check Monaco API for the list of options
  ...rest
}) {
  const descriptor = useRef(new Uri());
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [markers, setMarkers] = useState([]);
  const { editorTheme } = useTheme();
  const divRef = useRef(null);
  const valueRef = useRef(
    language === 'yaml'
      ? jsyaml.dump(value, { noRefs: true })
      : language === 'json'
      ? value
      : // ? JSON.stringify(value)
        value,
  );

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
  const memoizedOptions = useRef({});
  if (!isEqual(memoizedOptions.current, options)) {
    memoizedOptions.current = options;
  }

  useEffect(() => {
    // show warnings in a message strip at the bottom of editor
    if (autocompletionDisabled) {
      return;
    }
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
  }, [setMarkers, autocompletionDisabled]);
  useEffect(() => {
    // setup Monaco editor and pass value updates to parent

    // calling this function sets up autocompletion
    const { modelUri } = setAutocompleteOptions();
    descriptor.current = modelUri;

    const model =
      editor.getModel(modelUri) ||
      editor.createModel(valueRef.current, language, modelUri);

    // create editor and assign model with value and autocompletion
    editorRef.current = editor.create(divRef.current, {
      model: model,
      automaticLayout: true,
      language: language,
      fontSize: 15,
      theme: editorTheme,
      fixedOverflowWidgets: true,
      readOnly: readOnly,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      ...memoizedOptions.current,
    });

    // pass editor instance to parent
    if (typeof onMount === 'function') {
      onMount(editorRef.current);
    }

    // update parent component state on value change
    const onDidChangeModelContent = editorRef.current.onDidChangeModelContent(
      () => {
        const editorValue = editorRef.current.getValue();

        if (valueRef.current !== editorValue) {
          try {
            switch (language) {
              case 'javascript':
              case 'json':

              case 'typescript':
                setValue(editorValue);
                setError(null);
                break;
              // case 'json':
              //   setValue(JSON.parse(editorValue));
              //   setValue(null);
              //   break;
              case 'yaml':
                const parsed = multipleYamls
                  ? jsyaml.loadAll(editorValue)
                  : jsyaml.load(editorValue);

                if (typeof parsed !== 'object') {
                  setError(t('common.create-form.object-required'));
                  break;
                }
                setValue(parsed);
                setError(null);
                break;

              default:
                break;
            }
          } catch ({ message }) {
            // get the message until the newline
            setError(message.substr(0, message.indexOf('\n')));
          }
        }
      },
    );

    return () => {
      onDidChangeModelContent.dispose();
      editor.getModel(descriptor.current)?.dispose();
      editorRef.current.dispose();
    };
  }, [
    editorTheme,
    setAutocompleteOptions,
    language,
    multipleYamls,
    setValue,
    t,
    readOnly,
    onMount,
  ]);

  useEffect(() => {
    // refresh model on editor focus. Needed for cases when multiple editors are open simultaneously

    const onDidFocusEditorText = editorRef.current?.onDidFocusEditorText(() => {
      if (activeSchemaPath !== descriptor.current?.path) {
        setAutocompleteOptions();
      }
    });

    return () => {
      onDidFocusEditorText?.dispose();
    };
  }, [setAutocompleteOptions, activeSchemaPath]);

  return (
    <div
      className="resource-form__wrapper"
      {...rest}
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
