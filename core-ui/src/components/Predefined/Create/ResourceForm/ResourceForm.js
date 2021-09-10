import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useNotification } from 'react-shared';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { ModeSelector } from './components/ModeSelector';
import { Editor } from './components/Editor';
import { Presets } from './components/Presets';
import * as FormComponents from './components/FormComponents';
import './ResourceForm.scss';

ResourceForm.Label = FormComponents.Label;
ResourceForm.Input = FormComponents.Input;
ResourceForm.CollapsibleSection = FormComponents.CollapsibleSection;
ResourceForm.FormField = FormComponents.FormField;
ResourceForm.TextArea = FormComponents.TextArea;
// ResourceForm.ResourceNameField = FormComponents.ResourceNameField;

export function ResourceForm({
  pluralKind, // used for the request path
  nameSingular,
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
  const { t } = useTranslation();
  const [mode, setMode] = React.useState(ModeSelector.MODE_SIMPLE);

  translationKind = translationKind || pluralKind;

  if (!onCreate) {
    onCreate = async () => {
      try {
        await createFn();
        notification.notifySuccess({
          content: t('common.create-form.messages.success', {
            resourceType: nameSingular,
          }),
        });
        LuigiClient.linkManager()
          .fromContext('namespace')
          .navigate(
            `/${pluralKind.toLowerCase()}/details/${resource.metadata.name}`,
          );
      } catch (e) {
        console.error(e);
        notification.notifyError({
          content: t('common.create-form.messages.failure', {
            resourceType: nameSingular,
          }),
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
