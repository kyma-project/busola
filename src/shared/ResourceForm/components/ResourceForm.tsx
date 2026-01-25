import {
  FormEventHandler,
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classnames from 'classnames';
import jsyaml from 'js-yaml';
import { EditorActions } from 'shared/contexts/YamlEditorContext/EditorActions';
import EditorWrapper from 'shared/ResourceForm/fields/Editor';
import { useTranslation } from 'react-i18next';

import { ModeSelector } from './ModeSelector';
import { ResourceFormWrapper, ResourceFormWrapperProps } from './Wrapper';
import { PresetProps, Presets } from './Presets';
import { SingleFormProps } from './Single';
import { CollapsibleSectionProps } from './CollapsibleSection';
import { LabelProps } from './Label';
import { FormFieldProps } from './FormField';
import { TitleProps } from './Title';
import { useCreateResource } from '../useCreateResource';
import { K8sNameField, KeyValueField } from '../fields';
import jp from 'jsonpath';
import { Form, FormItem } from '@ui5/webcomponents-react';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

import { useAtom, useAtomValue } from 'jotai';
import {
  editViewModeAtom,
  EditViewTypes,
} from 'state/settings/editViewModeAtom';
import { createPortal } from 'react-dom';
import { UnsavedMessageBox } from 'shared/components/UnsavedMessageBox/UnsavedMessageBox';
import { getDescription, SchemaContext } from 'shared/helpers/schema';

import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useFormEditTracking } from 'shared/hooks/useFormEditTracking';
import './ResourceForm.scss';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { editor } from 'monaco-editor';

type ResourceFormProps = {
  pluralKind: string; // used for the request path
  singularName: string;
  resource: any;
  initialResource: any;
  updateInitialResource?: (res: any) => void;
  setResource: (res: any) => void;
  setCustomValid?: (isValid: boolean) => void;
  onChange?: FormEventHandler<HTMLElement>;
  formElementRef?: React.RefObject<HTMLFormElement>;
  children?: React.ReactNode;
  createUrl?: string;
  presets?: Array<any>;
  onPresetSelected?: (preset: any, variables: Record<string, string>) => void;
  renderEditor?: (params: {
    defaultEditor: React.ReactNode;
    Editor: FunctionComponent<any>;
  }) => React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  skipCreateFn?: (res: any) => boolean;
  afterCreatedFn?: (res: any) => void;
  afterCreatedCustomMessage?: string;
  className?: string;
  onlyYaml?: boolean;
  autocompletionDisabled?: boolean;
  readOnly?: boolean;
  handleNameChange?: (name: string) => void;
  nameProps?: Record<string, any>;
  labelsProps?: Record<string, any>;
  disableDefaultFields?: boolean;
  onModeChange?: (oldMode: string, newMode: string) => void;
  urlPath?: string;
  layoutNumber?: number;
  actions?: React.ReactNode;
  modeSelectorDisabled?: boolean;
  initialMode?: 'MODE_FORM' | 'MODE_YAML';
  yamlSearchDisabled?: boolean;
  yamlHideDisabled?: boolean;
  stickyHeaderHeight?: number;
  title?: React.ReactNode;
  resetLayout?: boolean;
  formWithoutPanel?: boolean;
};

type ResourceFormType = FunctionComponent<ResourceFormProps> & {
  Single: FunctionComponent<SingleFormProps>;
  Wrapper: FunctionComponent<ResourceFormWrapperProps>;
  CollapsibleSection: FunctionComponent<CollapsibleSectionProps>;
  Label: FunctionComponent<LabelProps>;
  FormField: FunctionComponent<FormFieldProps>;
  Title: FunctionComponent<TitleProps>;
  Presets: FunctionComponent<PresetProps>;
};

export const ResourceForm: ResourceFormType = (({
  pluralKind, // used for the request path
  singularName,
  resource,
  initialResource,
  updateInitialResource = () => {},
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
  title,
  resetLayout,
  formWithoutPanel,
}) => {
  const layoutState = useAtomValue(columnLayoutAtom);

  const isEdit = useMemo(
    () =>
      !!initialResource?.metadata?.uid && !layoutState?.showCreate?.resource,
    [initialResource, layoutState?.showCreate?.resource],
  );

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
    handleNameChange = (name) => {
      jp.value(resource, '$.metadata.name', name);
      jp.value(resource, "$.metadata.labels['app.kubernetes.io/name']", name);

      setResource({ ...resource });
    };
  }

  const editViewMode = useAtomValue(editViewModeAtom);
  const [editorError, setEditorError] = useState<string | null>(null);

  useFormEditTracking(resource, initialResource, !!editorError);

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

    const newEditViewMode = editViewMode as EditViewTypes;
    const modeSelectorForDynamicViewType =
      newEditViewMode.dynamicViewType === ModeSelector.MODE_FORM
        ? ModeSelector.MODE_FORM
        : ModeSelector.MODE_YAML;
    return newEditViewMode.preferencesViewType === 'MODE_DEFAULT'
      ? modeSelectorForDynamicViewType
      : (newEditViewMode.preferencesViewType ?? ModeSelector.MODE_FORM);
  };

  const [mode, setMode] = useState(handleInitialMode);
  const [actionsEditor, setActionsEditor] =
    useState<editor.IStandaloneCodeEditor | null>(null);
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
      onSelect={({ value, variables }) => {
        if (onPresetSelected) {
          onPresetSelected(value, variables);
        } else {
          setResource(value);
        }

        if (onChange) {
          onChange(new Event('input', { bubbles: true }) as any);
        }
      }}
    />
  );

  const editorComponent = (
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
      setValue={undefined}
    />
  );
  const editor = renderEditor
    ? renderEditor({ defaultEditor: editorComponent, Editor: EditorWrapper })
    : editorComponent;

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

  const isResourceEdited = useAtomValue(isResourceEditedAtom);
  const [isFormOpen, setIsFormOpen] = useAtom(isFormOpenAtom);
  const { navigateSafely } = useFormNavigation();
  const [resetBtnClicked, setResetBtnClicked] = useState(false);

  const handleRevert = () => {
    setResetBtnClicked(true);
    if (isResourceEdited?.isEdited) {
      setIsFormOpen({ ...isFormOpen, leavingForm: true });
    }
    navigateSafely(() => {
      setIsFormOpen({ formOpen: true, leavingForm: false });

      if (mode === 'MODE_YAML')
        actionsEditor?.setValue(jsyaml.dump(initialResource));
      else setResource(initialResource);
    });
  };

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
          stickyHeader={true}
          title={title}
          accessibleName={`${title} panel`}
          headerTop={stickyHeaderHeight + 'px'}
          headerActions={
            <>
              {actions}
              {/*@ts-expect-error Type mismatch between js and ts*/}
              <EditorActions
                val={convertedResource}
                editor={actionsEditor}
                title={`${resource?.metadata?.name || singularName}.yaml`}
                saveHidden
                searchDisabled={yamlSearchDisabled || mode === 'MODE_FORM'}
                hideDisabled={yamlHideDisabled || mode === 'MODE_FORM'}
                revertHidden={false}
                onRevert={handleRevert}
                resetBtnClicked={resetBtnClicked}
              />
            </>
          }
          modeActions={
            <>
              {onlyYaml ? null : (
                <ModeSelector
                  mode={mode}
                  setMode={(newMode: string) => {
                    setMode(newMode);
                    if (onModeChange) onModeChange(mode, newMode);
                  }}
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
      {createPortal(
        <UnsavedMessageBox
          isReset={resetBtnClicked}
          setIsReset={setResetBtnClicked}
          customMessage={
            resetBtnClicked
              ? isEdit
                ? t('common.messages.revert-changes-warning')
                : t('common.messages.reset-changes-warning')
              : undefined
          }
        />,
        document.body,
      )}
    </section>
  );
}) as ResourceFormType;
