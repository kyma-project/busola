import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Dialog, Button } from 'fundamental-react';
import { ModeSelector } from './ModeSelector/ModeSelector';
import { Editor } from './Editor/Editor';
import classnames from 'classnames';
import './CreateForm.scss';
import { CollapsibleSection } from './CollapsibleSection/CollapsibleSection';
import { Presets } from './Presets';
import { useTranslation } from 'react-i18next';

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
}) {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const [mode, setMode] = useState(ModeSelector.MODE_SIMPLE);
  const [formValid, setFormValid] = useState(false);

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
        className="advanced-form"
        onChange={onChange}
        ref={formElementRef}
        style={{
          display: mode === ModeSelector.MODE_ADVANCED ? null : 'none',
        }}
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
          onSelect={preset => setResource(preset.value)}
        />
      )}
      <ModeSelector
        mode={mode}
        setMode={setMode}
        style={{ position: 'sticky' }}
      />
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
