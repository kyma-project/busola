import React, { useState } from 'react';
import { ModeSelector } from './ModeSelector/ModeSelector';
import { Editor } from './Editor/Editor';
import './CreateForm.scss';
import { CollapsibleSection } from './CollapsibleSection/CollapsibleSection';
import { Presets } from './Presets';
import classnames from 'classnames';

export function CreateForm({
  title,
  simpleForm,
  advancedForm,
  resource,
  setResource,
  onCreate,
  onChange,
  toYaml,
  fromYaml,
  presets,
  formElementRef,
  editMode,
}) {
  const [mode, setMode] = useState(ModeSelector.MODE_SIMPLE);

  const formsToDisplay = (
    <>
      {mode === ModeSelector.MODE_SIMPLE && (
        <div onChange={onChange} className="simple-form">
          {simpleForm}
        </div>
      )}
      {mode === ModeSelector.MODE_YAML && (
        <Editor
          resource={toYaml(resource)}
          setResource={yaml => {
            setResource(fromYaml(yaml, resource));
          }}
        />
      )}

      {/* always keep the advanced form to ensure validation */}
      <form
        className={classnames('advanced-form', {
          hidden: mode !== ModeSelector.MODE_ADVANCED,
        })}
        onChange={onChange}
        ref={formElementRef}
        onSubmit={onCreate}
      >
        {advancedForm}
      </form>
    </>
  );

  const content = (
    <div className="create-form">
      {presets?.length && (
        <Presets
          presets={presets}
          onSelect={preset => {
            const { value } = preset;
            if (editMode) {
              value.name = resource.name;
              value.namespace = resource.namespace;
            }
            setResource(value);
            onChange(new Event('input', { bubbles: true }));
          }}
        />
      )}
      <ModeSelector mode={mode} setMode={setMode} />
      {formsToDisplay}
    </div>
  );

  return content;
}

CreateForm.CollapsibleSection = CollapsibleSection;

CreateForm.FormField = function({ label, input }) {
  return (
    <div className="fd-row form-field">
      <div className="fd-col fd-col-md--4 form-field__label">{label}</div>
      <div className="fd-col fd-col-md--7">{input}</div>
    </div>
  );
};

CreateForm.Section = ({ children }) => (
  <div className="fd-margin--sm">{children}</div>
);
