import React, { useEffect } from 'react';
import * as jp from 'jsonpath';
import classnames from 'classnames';

import { ModeSelector } from './components/ModeSelector';
import { Editor } from './components/Editor';
import { Presets } from './components/Presets';
import * as FormComponents from './components/FormComponents';
import { useCreateResource } from './useCreateResource';

import './ResourceForm.scss';

export function ResourceFormWrapper({
  resource,
  setResource,
  children,
  isAdvanced,
  setCustomValid,
  ...props
}) {
  useEffect(() => {
    if (setCustomValid) {
      const valid = React.Children.toArray(children)
        .filter(child => child.props.validate)
        .every(child => {
          if (child.props.propertyPath) {
            const value = jp.value(resource, child.props.propertyPath);
            return child.props.validate(value);
          } else {
            return child.props.validate(resource);
          }
        });
      setCustomValid(valid);
    }
  }, [resource, children, setCustomValid]);

  if (!resource) {
    return children;
  }

  return React.Children.map(children, child => {
    if (!child) {
      return null;
    } else if (child.type === React.Fragment) {
      return (
        <ResourceFormWrapper
          resource={resource}
          setResource={setResource}
          isAdvanced={isAdvanced}
        >
          {child.props.children}
        </ResourceFormWrapper>
      );
    } else if (child.props.simple && isAdvanced) {
      return null;
    } else if (child.props.advanced && !isAdvanced) {
      return null;
    } else if (!child.props.propertyPath) {
      if (typeof child.type === 'function') {
        return React.cloneElement(child, {
          resource,
          setResource,
          isAdvanced,
          ...props,
        });
      } else {
        return child;
      }
    } else {
      const valueSetter = value => {
        jp.value(resource, child.props.propertyPath, value);
        setResource({ ...resource });
      };

      const value =
        typeof child.props.value !== 'undefined'
          ? child.props.value
          : jp.value(resource, child.props.propertyPath) ??
            child.props.defaultValue;

      const setValue = child.props.setValue
        ? value => child.props.setValue(value, valueSetter)
        : valueSetter;

      return React.cloneElement(child, { isAdvanced, value, setValue });
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
  className,
  setCustomValid,
  ...props
}) {
  return (
    <section className={classnames('resource-form', className)}>
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
        <ResourceFormWrapper
          resource={resource}
          setResource={setResource}
          formElementRef={formElementRef}
          setCustomValid={setCustomValid}
        >
          {children}
        </ResourceFormWrapper>
      </form>
    </section>
  );
}

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
  renderEditor,
  createUrl,
  presets,
  onPresetSelected,
  afterCreatedFn,
  className,
}) {
  const createResource = useCreateResource(
    singularName,
    pluralKind,
    resource,
    initialResource,
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

        if (onChange) {
          onChange(new Event('input', { bubbles: true }));
        }
      }}
    />
  );

  let editor = <Editor value={resource} setValue={setResource} />;
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor })
    : editor;

  return (
    <section className={classnames('resource-form', className)}>
      {presetsSelector}
      <ModeSelector mode={mode} setMode={setMode} />
      <form ref={formElementRef} onSubmit={createResource}>
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
        {mode === ModeSelector.MODE_YAML && editor}
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
            setCustomValid={setCustomValid}
          >
            {children}
          </ResourceFormWrapper>
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
ResourceForm.ItemArray = FormComponents.ItemArray;
ResourceForm.ComboboxInput = FormComponents.ComboboxInput;
ResourceForm.ComboboxArrayInput = FormComponents.ComboboxArrayInput;
