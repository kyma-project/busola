import React from 'react';
import { MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { useAutocompleteWorker } from './autocompletion/useAutocompleteWorker';
import { useOnFocus } from './hooks/useOnFocus';
import { useOnBlur } from './hooks/useOnBlur';
import { useDisplayWarnings } from './hooks/useDisplayWarnings';
import { useUpdateValueOnParentChange } from './hooks/useUpdateValueOnParentChange';
import { useOnMount } from './hooks/useOnMount';
import { useOnChange } from './hooks/useOnChange';
import { useCreateEditor } from './hooks/useCreateEditor';

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
  ...rest
}) {
  const { t } = useTranslation();

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
              error: schemaError.error || schemaError.message || schemaError,
            })}
          </MessageStrip>
        )}
        {warnings.length ? (
          <div>
            <MessageStrip type="warning" className="fd-margin--sm break-word">
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
