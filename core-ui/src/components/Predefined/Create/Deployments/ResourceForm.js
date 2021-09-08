import React from 'react';
import LuigiClient from '@luigi-project/client';
import { FormInput, FormLabel } from 'fundamental-react';
import { Tooltip, useNotification } from 'react-shared';
import classnames from 'classnames';
import { CollapsibleSection2 } from 'shared/components/CreateForm/CollapsibleSection/CollapsibleSection';
import * as jp from 'jsonpath';
import pluralize from 'pluralize';
import { ModeSelector } from 'shared/components/CreateForm/ModeSelector/ModeSelector';
import { Editor } from 'shared/components/CreateForm/Editor/Editor';
import 'shared/components/CreateForm/CreateForm.scss';

ResourceForm.Label = ({ required, tooltipContent, children }) => {
  const label = <FormLabel required={required}>{children}</FormLabel>;

  if (tooltipContent) {
    return <Tooltip content={tooltipContent}>{label}</Tooltip>;
  } else {
    return label;
  }
};

ResourceForm.Input = ({ value, setValue, required, ...props }) => (
  <FormInput
    compact
    required={required}
    value={value}
    onChange={e => setValue(e.target.value)}
    {...props}
  />
);

ResourceForm.CollapsibleSection = CollapsibleSection2;

ResourceForm.FormField = function({
  label,
  input,
  className,
  required,
  tooltipContent,
  value,
  setValue,
}) {
  return (
    <div className={classnames('fd-row form-field', className)}>
      <div className="fd-col fd-col-md--4 form-field__label">
        <ResourceForm.Label required={required} tooltipContent={tooltipContent}>
          {label}
        </ResourceForm.Label>
      </div>
      <div className="fd-col fd-col-md--7">{input(value, setValue)}</div>
    </div>
  );
};

export function ResourceForm({
  kind, //todo
  resource,
  setResource,
  onCreate,
  onChange,
  formElementRef,
  children,
  renderEditor,
  createFn,
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

  const renderFormChildren = (children, isAdvanced) =>
    React.Children.map(children, child => {
      if (child.props.simple && isAdvanced) {
        return null;
      }
      if (child.props.advanced && !isAdvanced) {
        return null;
      }
      if (!child.props.yamlPath) {
        return child;
      }
      return React.cloneElement(child, {
        value: jp.value(resource, child.props.yamlPath),
        setValue: value => {
          jp.value(resource, child.props.yamlPath, value);
          setResource({ ...resource });
        },
      });
    });

  let editor = <Editor resource={resource} setResource={setResource} />;
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor })
    : editor;

  return (
    <form className="create-form" ref={formElementRef} onSubmit={onCreate}>
      <ModeSelector mode={mode} setMode={setMode} />
      {mode === ModeSelector.MODE_SIMPLE && (
        <div onChange={onChange} className="simple-form">
          {renderFormChildren(children, false)}
        </div>
      )}
      {mode === ModeSelector.MODE_YAML && editor}
      {/* always keep the advanced form to ensure validation */}
      <div
        className={classnames('advanced-form', {
          hidden: mode !== ModeSelector.MODE_ADVANCED,
        })}
        onChange={onChange}
      >
        {renderFormChildren(children, true)}
      </div>
    </form>
  );
}
