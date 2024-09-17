import { useEffect, useRef } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { useTranslation } from 'react-i18next';
import { useAutocompleteWorker } from './autocompletion/useAutocompleteWorker';
import { useOnFocus } from './hooks/useOnFocus';
import { useOnBlur } from './hooks/useOnBlur';
import { useDisplayWarnings } from './hooks/useDisplayWarnings';
import { useUpdateValueOnParentChange } from './hooks/useUpdateValueOnParentChange';
import { useOnMount } from './hooks/useOnMount';
import { useOnChange } from './hooks/useOnChange';
import { useCreateEditor } from './hooks/useCreateEditor';

import { spacing } from '@ui5/webcomponents-react-base';
import './Editor.scss';

export function Editor({
  value = '',
  error, // used by the resourceFormWrapper to display error that previous input is used
  onChange,
  readOnly,
  language,
  onMount,
  updateValueOnParentChange,
  schemaId, // key to find the json schema,
  autocompletionDisabled,
  height,
  onBlur,
  onFocus,
  options = {}, // IEditorOptions, check Monaco API for the list of options
  placeholder = null,
  ...rest
}) {
  const { t } = useTranslation();
  const prevValueRef = useRef(value);

  // prepare autocompletion
  const {
    setAutocompleteOptions,
    error: schemaError,
    loading,
  } = useAutocompleteWorker({
    value,
    schemaId,
    autocompletionDisabled,
    readOnly,
    language,
  });

  // set autocompletion global context to the current editor and initialize an editor instance
  const { editorInstance, divRef, descriptor } = useCreateEditor({
    value,
    options,
    setAutocompleteOptions,
    language,
    readOnly,
  });

  // manage listeners
  useOnFocus({
    editorInstance,
    onFocus,
  });
  useOnBlur({ editorInstance, onBlur });
  useOnMount({ editorInstance, onMount });
  useOnChange({ editorInstance, onChange });

  // update editor when was error
  useEffect(() => {
    if (prevValueRef.current !== value && editorInstance && error) {
      editorInstance.setValue(value);
      prevValueRef.current = value;
    }
  }, [value, editorInstance, error]);

  useEffect(() => {
    if (prevValueRef.current !== value && readOnly) {
      editorInstance.setValue(value);
      prevValueRef.current = value;
    }
  }, [value, editorInstance, readOnly]);

  useUpdateValueOnParentChange({
    updateValueOnParentChange,
    editorInstance,
    value,
    error,
  });
  const warnings = useDisplayWarnings({ autocompletionDisabled, descriptor });

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
      {placeholder && !!!value && (
        <div className="resource-form__placeholder">{placeholder}</div>
      )}
      <div className="resource-form__legend">
        {error && (
          <MessageStrip
            design="Negative"
            hideCloseButton
            className="break-word"
            style={spacing.sapUiSmallMargin}
          >
            {t('common.create-form.editor-error', { error })}
          </MessageStrip>
        )}
        {schemaError && (
          <MessageStrip
            design="Warning"
            className="break-word"
            style={spacing.sapUiSmallMargin}
          >
            {t('common.create-form.autocomplete-unavailable-error', {
              error: schemaError.error || schemaError.message || schemaError,
            })}
          </MessageStrip>
        )}
        {warnings.length ? (
          <MessageStrip
            design="Warning"
            hideCloseButton
            className="break-word"
            style={spacing.sapUiSmallMargin}
          >
            {warnings.map(m => (
              <span
                className="line"
                key={`${m.startLineNumber}${m.startColumn}`}
              >
                {t('common.tooltips.line')} {m.startLineNumber},{' '}
                {t('common.tooltips.column')} {m.startColumn}: {m.message}
              </span>
            ))}
          </MessageStrip>
        ) : null}
      </div>
    </div>
  );
}
