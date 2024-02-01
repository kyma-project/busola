import React, { useRef, useEffect, useMemo } from 'react';
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
import { Form, FormItem } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './ResourceForm.scss';

export function ResourceForm({
  pluralKind, // used for the request path
  singularName,
  resource,
  initialResource,
  initialUnchangedResource,
  setResource,
  setCustomValid,
  onChange,
  formElementRef,
  children,
  createUrl,
  presets,
  onPresetSelected,
  onReset,
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
  onModeChange,
  urlPath,
  handleSetResetFormFn = () => {},
  layoutNumber,
}) {
  // readonly schema ID, set only once
  const resourceSchemaId = useMemo(
    () => resource?.apiVersion + '/' + resource?.kind,
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const resourceRef = useRef(null);

  if (!handleNameChange) {
    handleNameChange = name => {
      jp.value(resource, '$.metadata.name', name);
      jp.value(resource, "$.metadata.labels['app.kubernetes.io/name']", name);

      setResource({ ...resource });
    };
  }

  useEffect(() => {
    if (!resourceRef.current) {
      resourceRef.current = JSON.stringify(resource);
      handleSetResetFormFn(() => () => {
        setResource(JSON.parse(resourceRef.current));
        if (onReset) onReset();
      });
    }
  }, [handleSetResetFormFn, onReset, resource, resourceRef, setResource]);

  const { t } = useTranslation();
  const createResource = useCreateResource({
    singularName,
    pluralKind,
    resource,
    initialResource,
    initialUnchangedResource,
    createUrl,
    afterCreatedFn,
    toggleFormFn,
    urlPath,
    layoutNumber,
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
      if (mode === ModeSelector.MODE_YAML) {
        setCustomValid(true);
      } else {
        setCustomValid(validationRef.current);
      }
    }
    validationRef.current = true;
  }, [setCustomValid, resource, children, mode]);

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
      updateValueOnParentChange={true}
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
          setMode={newMode => {
            setMode(newMode);
            if (onModeChange) onModeChange(mode, newMode);
          }}
          isEditing={!!initialResource}
        />
      )}
      <form ref={formElementRef} onSubmit={onSubmit || createResource}>
        {mode === ModeSelector.MODE_YAML && (
          <div className="yaml-form" style={{ width: '100%', height: '100%' }}>
            <EditorActions
              val={convertedResource}
              editor={actionsEditor}
              title={`${resource?.metadata?.name || singularName}.yaml`}
              saveHidden
            />
            {editor}
          </div>
        )}
        <Form
          className={classnames(
            'resource-form ui5-content-density-compact',
            className,
          )}
          columnsL={1}
          columnsM={1}
          columnsS={1}
          columnsXL={1}
          labelSpanL={0}
          labelSpanM={0}
          labelSpanS={0}
          labelSpanXL={0}
          as="div"
        >
          {mode === ModeSelector.MODE_SIMPLE && (
            <FormItem>
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
            </FormItem>
          )}
          {mode === ModeSelector.MODE_ADVANCED && (
            <FormItem>
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
                        style={spacing.sapUiSmallMarginTop}
                        inputInfo={t('common.tooltips.key-value')}
                        {...labelsProps}
                      />
                      <KeyValueField
                        advanced
                        propertyPath="$.metadata.annotations"
                        title={t('common.headers.annotations')}
                        inputInfo={t('common.tooltips.key-value')}
                      />
                    </>
                  )}
                  {children}
                </ResourceFormWrapper>
              </div>
            </FormItem>
          )}
        </Form>
      </form>
    </section>
  );
}
