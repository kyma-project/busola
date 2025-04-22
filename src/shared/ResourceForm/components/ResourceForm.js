import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import jsyaml from 'js-yaml';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import EditorWrapper from 'shared/ResourceForm/fields/Editor';
import { useTranslation } from 'react-i18next';

import { ModeSelector } from './ModeSelector';
import { ResourceFormWrapper } from './Wrapper';
import { Presets } from './Presets';
import { useCreateResource } from '../useCreateResource';
import { K8sNameField, KeyValueField } from '../fields';
import jp from 'jsonpath';
import { Form, FormItem } from '@ui5/webcomponents-react';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

import { useRecoilValue } from 'recoil';
import { editViewModeState } from 'state/preferences/editViewModeAtom';
import { createPortal } from 'react-dom';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { getDescription, SchemaContext } from 'shared/helpers/schema';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFormEditTracking } from 'shared/hooks/useFormEditTracking';
import './ResourceForm.scss';

export function ResourceForm({
  pluralKind, // used for the request path
  singularName,
  resource,
  initialResource,
  updateInitialResource,
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
  skipCreateFn,
  afterCreatedFn,
  afterCreatedCustomMessage,
  className,
  onlyYaml = false,
  autocompletionDisabled,
  readOnly,
  handleNameChange,
  nameProps,
  labelsProps,
  disableDefaultFields,
  onModeChange,
  urlPath,
  layoutNumber,
  actions,
  modeSelectorDisabled = false,
  initialMode,
  yamlSearchDisabled,
  yamlHideDisabled,
  stickyHeaderHeight,
  resetLayout,
  formWithoutPanel,
}) {
  const layoutState = useRecoilValue(columnLayoutState);

  const isEdit = useMemo(() => !!initialResource?.metadata?.name, [
    initialResource,
  ]);

  useEffect(() => {
    if (layoutState?.showCreate?.resource) {
      setResource(JSON.parse(JSON.stringify(layoutState.showCreate.resource)));
    } else if (layoutState?.showEdit?.resource) {
      setResource(JSON.parse(JSON.stringify(layoutState.showEdit.resource)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutState?.showCreate?.resource, layoutState?.showEdit?.resource]);

  // readonly schema ID, set only once
  const resourceSchemaId = useMemo(
    () => resource?.apiVersion + '/' + resource?.kind,
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!handleNameChange) {
    handleNameChange = name => {
      jp.value(resource, '$.metadata.name', name);
      jp.value(resource, "$.metadata.labels['app.kubernetes.io/name']", name);

      setResource({ ...resource });
    };
  }

  const editViewMode = useRecoilValue(editViewModeState);
  const [editorError, setEditorError] = useState(null);

  useFormEditTracking(resource, initialResource, editorError);

  const { t } = useTranslation();
  const createResource = useCreateResource({
    singularName,
    pluralKind,
    resource,
    initialResource,
    updateInitialResource,
    createUrl,
    skipCreateFn,
    afterCreatedFn,
    urlPath,
    layoutNumber,
    resetLayout,
    afterCreatedCustomMessage,
  });

  const schema = useContext(SchemaContext);

  const handleInitialMode = () => {
    if (initialMode) {
      switch (initialMode) {
        case 'MODE_YAML':
          return ModeSelector.MODE_YAML;
        case 'MODE_FORM':
        default:
          return ModeSelector.MODE_FORM;
      }
    }

    if (onlyYaml) return ModeSelector.MODE_YAML;

    return editViewMode.preferencesViewType === 'MODE_DEFAULT'
      ? editViewMode.dynamicViewType === ModeSelector.MODE_FORM
        ? ModeSelector.MODE_FORM
        : ModeSelector.MODE_YAML
      : editViewMode.preferencesViewType ?? ModeSelector.MODE_FORM;
  };

  const [mode, setMode] = React.useState(handleInitialMode);
  const [actionsEditor, setActionsEditor] = React.useState(null);
  const validationRef = useRef(true);

  useEffect(() => {
    if (setCustomValid) {
      if (mode === ModeSelector.MODE_YAML) {
        setCustomValid(true);
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
      height="100%"
      value={resource}
      onChange={setResource}
      onMount={setActionsEditor}
      autocompletionDisabled={autocompletionDisabled}
      readOnly={readOnly}
      schemaId={resourceSchemaId}
      updateValueOnParentChange={true}
      setEditorError={setEditorError}
      schema={schema}
    />
  );
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor: EditorWrapper })
    : editor;

  const nameDesc = getDescription(schema, 'metadata.name');
  const labelsDesc = getDescription(schema, 'metadata.labels');
  const annotationsDesc = getDescription(schema, 'metadata.annotations');

  const formContent = (
    <Form
      className={classnames(
        'resource-form ui5-content-density-compact',
        className,
      )}
      style={{ overflowX: 'hidden' }}
      onChange={onChange}
      labelSpan="S0 M0 L0 XL0"
      layout="S1 M1 L1 XL1"
    >
      {(mode === ModeSelector.MODE_FORM || formWithoutPanel) && (
        <FormItem>
          <div className="full-width sap-margin-bottom-tiny">
            <ResourceFormWrapper
              resource={resource}
              setResource={setResource}
              validationRef={validationRef}
            >
              {presetsSelector}

              {!disableDefaultFields && (
                <>
                  <K8sNameField
                    propertyPath="$.metadata.name"
                    kind={singularName}
                    readOnly={readOnly || isEdit}
                    setValue={handleNameChange}
                    tooltipContent={nameDesc}
                    {...nameProps}
                  />
                  <KeyValueField
                    propertyPath="$.metadata.labels"
                    title={t('common.headers.labels')}
                    className="sap-margin-top-small"
                    inputInfo={t('common.tooltips.key-value')}
                    tooltipContent={labelsDesc}
                    {...labelsProps}
                  />
                  <KeyValueField
                    propertyPath="$.metadata.annotations"
                    title={t('common.headers.annotations')}
                    inputInfo={t('common.tooltips.key-value')}
                    tooltipContent={annotationsDesc}
                  />
                </>
              )}
              {children}
            </ResourceFormWrapper>
          </div>
        </FormItem>
      )}
    </Form>
  );

  return (
    <section className={classnames('resource-form', className)}>
      {formWithoutPanel ? (
        <form
          ref={formElementRef}
          onSubmit={onSubmit || createResource}
          style={{ height: '100%' }}
          onChange={onChange}
        >
          {formContent}
        </form>
      ) : (
        <UI5Panel
          key={`edit-panel-${singularName}`}
          className="resource-form--panel card-shadow sap-margin-y-small"
          disableMargin
          stickyHeader={true}
          headerTop={stickyHeaderHeight + 'px'}
          headerActions={
            <>
              {actions}
              <EditorActions
                val={convertedResource}
                editor={actionsEditor}
                title={`${resource?.metadata?.name || singularName}.yaml`}
                saveHidden
                searchDisabled={yamlSearchDisabled || mode === 'MODE_FORM'}
                hideDisabled={yamlHideDisabled || mode === 'MODE_FORM'}
              />
            </>
          }
          modeActions={
            <>
              {onlyYaml ? null : (
                <ModeSelector
                  mode={mode}
                  setMode={newMode => {
                    setMode(newMode);
                    if (onModeChange) onModeChange(mode, newMode);
                  }}
                  isEditing={isEdit}
                  isDisabled={modeSelectorDisabled}
                />
              )}
            </>
          }
        >
          <form
            ref={formElementRef}
            onSubmit={onSubmit || createResource}
            style={{ height: '100%' }}
            onChange={onChange}
          >
            {mode === ModeSelector.MODE_YAML && (
              <div className="yaml-form">{editor}</div>
            )}
            {formContent}
          </form>
        </UI5Panel>
      )}
      {createPortal(<UnsavedMessageBox />, document.body)}
    </section>
  );
}
