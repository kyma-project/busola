import React, { useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import jsyaml from 'js-yaml';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import EditorWrapper from 'shared/ResourceForm/fields/Editor';
import { useTranslation } from 'react-i18next';

import { ModeSelector } from './ModeSelector';
import { ResourceFormWrapper } from './Wrapper';
import { Presets } from './Presets';
import { useCreateResource } from '../useCreateResource';
import { KeyValueField, K8sNameField } from '../fields';
import * as jp from 'jsonpath';

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
  autocompletionDisabled,
  readOnly,
  handleNameChange,
  nameProps,
  labelsProps,
  disableDefaultFields,
}) {
  // readonly schema ID, set only once
  const [resourceSchemaId] = useState(
    resource.apiVersion + '/' + resource.kind,
  );

  if (!handleNameChange) {
    handleNameChange = name => {
      jp.value(resource, '$.metadata.name', name);
      jp.value(resource, "$.metadata.labels['app.kubernetes.io/name']", name);

      setResource({ ...resource });
    };
  }

  const { t } = useTranslation();
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
      autocompletionDisabled={autocompletionDisabled}
      readOnly={readOnly}
      schemaId={resourceSchemaId}
      updateValueOnParentChange={presets?.length}
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
              {!disableDefaultFields && (
                <K8sNameField
                  propertyPath="$.metadata.name"
                  kind={singularName}
                  readOnly={readOnly || !!initialResource}
                  setValue={handleNameChange}
                  {...nameProps}
                />
              )}
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
            {!disableDefaultFields && (
              <>
                <K8sNameField
                  propertyPath="$.metadata.name"
                  kind={singularName}
                  readOnly={readOnly || !!initialResource}
                  setValue={handleNameChange}
                  {...nameProps}
                />
                <KeyValueField
                  advanced
                  propertyPath="$.metadata.labels"
                  title={t('common.headers.labels')}
                  className="fd-margin-top--sm"
                  showInfo={t('common.tooltips.key-value')}
                  {...labelsProps}
                />
                <KeyValueField
                  advanced
                  propertyPath="$.metadata.annotations"
                  title={t('common.headers.annotations')}
                  showInfo={t('common.tooltips.key-value')}
                />
              </>
            )}
            {children}
          </ResourceFormWrapper>
        </div>
      </form>
    </section>
  );
}
