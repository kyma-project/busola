import React, { useRef, useEffect } from 'react';
import classnames from 'classnames';
import jsyaml from 'js-yaml';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import EditorWrapper from 'shared/ResourceForm/fields/Editor';
import { useTranslation } from 'react-i18next';

import { ModeSelector } from './ModeSelector';
import { ResourceFormWrapper } from './Wrapper';
import { Presets } from './Presets';
import { useCreateResource } from '../useCreateResource';

import './ResourceForm.scss';

export function ResourceForm({
  pluralKind, // used for the request path
  singularName,
  resource,
  initialResource,
  setResource,
  setCustomValid,
  onChange,
  formElementRef,
  children,
  createUrl,
  presets,
  onPresetSelected,
  renderEditor,
  onSubmit,
  afterCreatedFn,
  className,
  onlyYaml = false,
  toggleFormFn,
  customSchemaId,
  autocompletionDisabled,
  customSchemaUri,
  readOnly,
}) {
  const { i18n } = useTranslation();
  const createResource = useCreateResource({
    singularName,
    pluralKind,
    resource,
    initialResource,
    createUrl,
    afterCreatedFn,
    toggleFormFn,
  });

  const handleInitialMode = () => {
    if (onlyYaml) return ModeSelector.MODE_YAML;

    if (!!initialResource) return ModeSelector.MODE_ADVANCED;

    return ModeSelector.MODE_SIMPLE;
  };

  const [mode, setMode] = React.useState(handleInitialMode);
  const [actionsEditor, setActionsEditor] = React.useState(null);
  const validationRef = useRef(true);

  useEffect(() => {
    if (setCustomValid) {
      setCustomValid(validationRef.current);
    }
    validationRef.current = true;
  }, [setCustomValid, resource, children]);

  const convertedResource = jsyaml.dump(resource);

  const presetsSelector = presets?.length && (
    <Presets
      presets={presets}
      onSelect={({ value }) => {
        if (onPresetSelected) {
          onPresetSelected(value);
        } else {
          setResource(value);
        }

        if (onChange) {
          onChange(new Event('input', { bubbles: true }));
        }
      }}
    />
  );

  let editor = (
    <EditorWrapper
      value={resource}
      onChange={setResource}
      onMount={setActionsEditor}
      customSchemaId={customSchemaId}
      customSchemaUri={customSchemaUri}
      autocompletionDisabled={autocompletionDisabled}
      readOnly={readOnly}
    />
  );
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor: EditorWrapper })
    : editor;
  return (
    <section className={classnames('resource-form', className)}>
      {presetsSelector}
      {onlyYaml ? null : (
        <ModeSelector
          mode={mode}
          setMode={setMode}
          isEditing={!!initialResource}
        />
      )}
      <form ref={formElementRef} onSubmit={onSubmit || createResource}>
        {mode === ModeSelector.MODE_SIMPLE && (
          <div onChange={onChange} className="simple-form">
            <ResourceFormWrapper
              resource={resource}
              setResource={setResource}
              isAdvanced={false}
            >
              {children}
            </ResourceFormWrapper>
          </div>
        )}
        {mode === ModeSelector.MODE_YAML && (
          <>
            <EditorActions
              val={convertedResource}
              editor={actionsEditor}
              title={`${resource?.metadata?.name || singularName}.yaml`}
              saveHidden
              i18n={i18n}
            />
            {editor}
          </>
        )}
        {/* always keep the advanced form to ensure validation */}
        <div
          className="advanced-form"
          onChange={onChange}
          hidden={mode !== ModeSelector.MODE_ADVANCED}
        >
          <ResourceFormWrapper
            resource={resource}
            setResource={setResource}
            isAdvanced={true}
            validationRef={validationRef}
          >
            {children}
          </ResourceFormWrapper>
        </div>
      </form>
    </section>
  );
}
