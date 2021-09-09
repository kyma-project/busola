import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useNotification } from 'react-shared';
import * as jp from 'jsonpath';
import pluralize from 'pluralize';
import { ModeSelector } from './components/ModeSelector';
import { Editor } from './components/Editor';
import { Presets } from './components/Presets';
import * as FormComponents from './components/FormComponents';
import './ResourceForm.scss';

ResourceForm.Label = FormComponents.Label;
ResourceForm.Input = FormComponents.Input;
ResourceForm.CollapsibleSection = FormComponents.CollapsibleSection;
ResourceForm.FormField = FormComponents.FormField;

export function ResourceForm({
  kind,
  resource,
  setResource,
  onCreate,
  onChange,
  formElementRef,
  children,
  renderEditor,
  createFn,
  presets,
  onPresetSelected,
}) {
  const notification = useNotification();
  const [mode, setMode] = React.useState(ModeSelector.MODE_SIMPLE);

  if (!onCreate) {
    onCreate = async () => {
      try {
        await createFn();
        notification.notifySuccess({
          content: kind + 'created',
        });
        LuigiClient.linkManager()
          .fromContext('namespace')
          .navigate(`/${pluralize(kind)}/details/${resource.metadata.name}`);
      } catch (e) {
        console.error(e);
        notification.notifyError({
          content: 'cannot create' + kind + ': ' + e.message,
        });
        return false;
      }
    };
  }

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
    <article className="resource-form">
      {presetsSelector}
      <ModeSelector mode={mode} setMode={setMode} />
      <form ref={formElementRef} onSubmit={onCreate}>
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
    </article>
  );
}
