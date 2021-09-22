import React from 'react';
import * as jp from 'jsonpath';
import { ModeSelector } from './components/ModeSelector';
import { Editor } from './components/Editor';
import { Presets } from './components/Presets';
import * as FormComponents from './components/FormComponents';
import './ResourceForm.scss';
import { useCreateResource } from './useCreateResource';

function ResourceFormWrapper({ resource, setResource, children, ...props }) {
  return React.Children.map(children, child => {
    if (!child) {
      return null;
    } else if (!child.props.propertyPath) {
      return React.cloneElement(child, {
        resource,
        setResource,
        ...props,
      });
    } else {
      return React.cloneElement(child, {
        value: jp.value(resource, child.props.propertyPath),
        setValue: value => {
          jp.value(resource, child.props.propertyPath, value);
          setResource({ ...resource });
        },
        ...props,
      });
    }
  });
}

function SingleForm({
  formElementRef,
  createResource,
  children,
  resource,
  setResource,
  onValid,
  ...props
}) {
  return (
    <form
      ref={formElementRef}
      onSubmit={createResource}
      onChange={() => {
        if (onValid) {
          setTimeout(() => {
            onValid(formElementRef.current?.checkValidity());
          });
        }
      }}
      {...props}
    >
      <div>
        <ResourceFormWrapper
          resource={resource}
          setResource={setResource}
          formElementRef={formElementRef}
        >
          {children}
        </ResourceFormWrapper>
      </div>
    </form>
  );
}

export function ResourceForm({
  pluralKind, // used for the request path
  singularName,
  resource,
  setResource,
  onChange,
  formElementRef,
  children,
  renderEditor,
  createUrl,
  presets,
  onPresetSelected,
  afterCreatedFn,
}) {
  const createResource = useCreateResource(
    singularName,
    pluralKind,
    resource,
    createUrl,
    afterCreatedFn,
  );

  const [mode, setMode] = React.useState(ModeSelector.MODE_SIMPLE);

  const presetsSelector = presets?.length && (
    <Presets
      presets={presets}
      onSelect={({ value }) => {
        if (onPresetSelected) {
          onPresetSelected(value);
        } else {
          setResource(value);
        }
        onChange(new Event('input', { bubbles: true }));
      }}
    />
  );

  const renderFormChildren = (children, isAdvanced) =>
    React.Children.map(children, child => {
      if (child.props.simple && isAdvanced) {
        return null;
      }
      if (child.props.advanced && !isAdvanced) {
        return null;
      }
      if (!child.props.propertyPath) {
        return child;
      }
      return React.cloneElement(child, {
        value: jp.value(resource, child.props.propertyPath),
        setValue: value => {
          jp.value(resource, child.props.propertyPath, value);
          setResource({ ...resource });
        },
      });
    });

  let editor = <Editor resource={resource} setResource={setResource} />;
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor })
    : editor;

  return (
    <section className="resource-form">
      {presetsSelector}
      <ModeSelector mode={mode} setMode={setMode} />
      <form ref={formElementRef} onSubmit={createResource}>
        {mode === ModeSelector.MODE_SIMPLE && (
          <div onChange={onChange} className="simple-form">
            {renderFormChildren(children, false)}
          </div>
        )}
        {mode === ModeSelector.MODE_YAML && editor}
        {/* always keep the advanced form to ensure validation */}
        <div
          className="advanced-form"
          onChange={onChange}
          hidden={mode !== ModeSelector.MODE_ADVANCED}
        >
          {renderFormChildren(children, true)}
        </div>
      </form>
    </section>
  );
}

ResourceForm.Single = SingleForm;
ResourceForm.Wrapper = ResourceFormWrapper;

ResourceForm.Label = FormComponents.Label;
ResourceForm.CollapsibleSection = FormComponents.CollapsibleSection;
ResourceForm.FormField = FormComponents.FormField;
ResourceForm.TextArrayInput = FormComponents.TextArrayInput;
ResourceForm.K8sNameField = FormComponents.K8sNameField;
ResourceForm.KeyValueField = FormComponents.KeyValueField;
