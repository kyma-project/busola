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
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

import { spacing } from '@ui5/webcomponents-react-base';
import './ResourceForm.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import { editViewModeState } from 'state/preferences/editViewModeAtom';
import { isResourceEditedState } from 'state/resourceEditedAtom';

const excludeStatus = resource => {
  const modifiedResource = { ...resource };
  delete modifiedResource.status;
  delete modifiedResource.metadata?.resourceVersion;
  delete modifiedResource.metadata?.managedFields;
  return modifiedResource;
};

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
  renderEditor,
  onSubmit,
  afterCreatedFn,
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
  isEdit,
  stickyHeaderHeight,
  resetLayout,
}) {
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
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const { isEdited, isSaved } = isResourceEdited;

  useEffect(() => {
    if (
      !isEdited &&
      !isSaved &&
      JSON.stringify(excludeStatus(resource)) !==
        JSON.stringify(excludeStatus(initialResource))
    ) {
      setIsResourceEdited({ isEdited: true });
    }

    if (
      JSON.stringify(excludeStatus(resource)) ===
        JSON.stringify(excludeStatus(initialResource)) &&
      (isEdited || isSaved)
    ) {
      setIsResourceEdited({ isEdited: false, warningOpen: false });
    }
  }, [initialResource, isEdited, isSaved, resource, setIsResourceEdited]);

  const { t } = useTranslation();
  const createResource = useCreateResource({
    singularName,
    pluralKind,
    resource,
    initialResource,
    initialUnchangedResource,
    createUrl,
    afterCreatedFn,
    urlPath,
    layoutNumber,
    setResource,
    resetLayout,
  });

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
    />
  );
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor: EditorWrapper })
    : editor;

  const formContent = (
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
      style={{ overflowX: 'hidden' }}
      onChange={onChange}
    >
      {mode === ModeSelector.MODE_FORM && (
        <FormItem>
          <div
            className="full-width"
            style={spacing.sapUiTinyMarginBottom}
            hidden={mode !== ModeSelector.MODE_FORM}
          >
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
                    readOnly={readOnly || !!initialUnchangedResource}
                    setValue={handleNameChange}
                    {...nameProps}
                  />
                  <KeyValueField
                    propertyPath="$.metadata.labels"
                    title={t('common.headers.labels')}
                    style={spacing.sapUiSmallMarginTop}
                    inputInfo={t('common.tooltips.key-value')}
                    {...labelsProps}
                  />
                  <KeyValueField
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
  );

  return (
    <section className={classnames('resource-form', className)}>
      <UI5Panel
        key={`edit-panel-${singularName}`}
        className="resource-form--panel card-shadow"
        style={spacing.sapUiSmallMarginTopBottom}
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
                isEditing={!!isEdit}
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
    </section>
  );
}
