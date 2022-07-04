import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'shared/contexts/ThemeContext';
import { editor, Uri } from 'monaco-editor';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useAutocompleteWorker } from './useAutocompleteWorker';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { isEqual } from 'lodash';

import './Editor.scss';

export function Editor({
  value,
  error, // used by the resourceFormWrapper to display error that previous input is used
  onChange,
  readOnly,
  language,
  onMount,
  customSchemaId, // custom key to find the json schema, don't use if the default key works (apiVersion/kind)
  autocompletionDisabled,
  customSchemaUri, // custom link to be displayed in the autocompletion tooltips
  height,
  onBlur,
  onFocus,
  options = {}, // IEditorOptions, check Monaco API for the list of options
  ...rest
}) {
  const descriptor = useRef(new Uri());
  const { t } = useTranslation();

  const [markers, setMarkers] = useState([]);
  const { editorTheme } = useTheme();
  const divRef = useRef(null);
  // const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);

  const [hasFocus, setHasFocus] = useState(false);

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
    language,
  });
  const memoizedOptions = useRef({});
  if (!isEqual(memoizedOptions.current, options)) {
    memoizedOptions.current = options;
  }

  useEffect(() => {
    // focus listener
    if (!editorInstance) return;
    const focusListener = editorInstance.onDidFocusEditorText(() => {
      setHasFocus(true);
      if (typeof onFocus === 'function') {
        onFocus();
      }
    });
    // refresh model on editor focus. Needed for cases when multiple editors are open simultaneously
    if (activeSchemaPath !== descriptor.current?.path) {
      setAutocompleteOptions();
    }
    return () => {
      focusListener.dispose();
    };
  }, [editorInstance, onFocus, setAutocompleteOptions, activeSchemaPath]);

  useEffect(() => {
    //blur listener
    if (!editorInstance) return;
    const blurListener = editorInstance.onDidBlurEditorText(() => {
      setHasFocus(false);
      if (typeof onBlur === 'function') {
        onBlur();
      }
    });
    return () => {
      blurListener.dispose();
    };
  }, [editorInstance, onBlur]);

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
    // update editor value when it comes as a prop
    if (!hasFocus && editorInstance && editorInstance.getValue() !== value) {
      editorInstance.setValue(value);
    }
  }, [editorInstance, value, hasFocus]);

  useEffect(() => {
    // setup Monaco editor and pass value updates to parent

    // calling this function sets up autocompletion
    const { modelUri } = setAutocompleteOptions();
    descriptor.current = modelUri;

    const model =
      editor.getModel(modelUri) ||
      editor.createModel(value, language, modelUri);

    // create editor and assign model with value and autocompletion
    const instance = editor.create(divRef.current, {
      model: model,
      automaticLayout: true,
      language: language,
      theme: editorTheme,
      fixedOverflowWidgets: true,
      readOnly: readOnly,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      ...memoizedOptions.current,
    });

    setEditorInstance(instance);

    // pass editor instance to parent
    if (typeof onMount === 'function') {
      onMount(instance);
    }

    // update parent component state on value change
    const changeListener = instance.onDidChangeModelContent(() => {
      const editorValue = instance.getValue();
      onChange(editorValue);
    });

    return () => {
      changeListener.dispose();
      editor.getModel(descriptor.current)?.dispose();
      instance.dispose();
    };
    // missing dependencies: 'value'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editorTheme,
    setAutocompleteOptions,
    setEditorInstance,
    language,
    t,
    readOnly,
    onMount,
    onChange,
  ]);

  useEffect(() => {
    // refresh model on editor focus. Needed for cases when multiple editors are open simultaneously
    const onDidFocusEditorText = editorInstance?.onDidFocusEditorText(() => {
      if (activeSchemaPath !== descriptor.current?.path) {
        setAutocompleteOptions();
      }
    });
    return () => {
      onDidFocusEditorText?.dispose();
    };
  }, [editorInstance, setAutocompleteOptions, activeSchemaPath]);

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
          <MessageStrip type="error" className="fd-margin--sm break-word">
            {t('common.create-form.editor-error', { error })}
          </MessageStrip>
        )}
        {schemaError && (
          <MessageStrip
            type="warning"
            className="fd-margin--sm break-word"
            dismissible
          >
            {t('common.create-form.autocomplete-unavailable-error', {
              error: schemaError,
            })}
          </MessageStrip>
        )}
        {markers.length ? (
          <div>
            <MessageStrip type="warning" className="fd-margin--sm break-word">
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
