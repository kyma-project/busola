import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormInput,
  Checkbox,
  Select,
  MessageStrip,
  Dialog,
  Button,
} from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

export function PathSelectorDialog({
  schema,
  show,
  onCancel,
  onAdd,
  allowCustom = false,
}) {
  const [path, setPath] = useState('');
  return (
    <Dialog
      show={show}
      title={'«Select path»'}
      actions={[
        <Button option="emphasized" onClick={() => onAdd(path)}>
          «add»
        </Button>,
        <Button option="transparent" onClick={onCancel}>
          «cancel»
        </Button>,
      ]}
    >
      <FormInput value={path} onChange={e => setPath(e.target.value)} />
    </Dialog>
  );
}

export function ColumnsInput({
  value: columns,
  setValue: setColumns,
  translations,
  setTranslations,
  widgets = {},
  spec,
}) {
  const { t } = useTranslation();
  const [showPathSelector, setShowPathSelector] = useState(false);

  const addPath = path => {};

  if (!columns?.length) {
    return (
      <MessageStrip type="warning">
        {t('extensibility.starter-modal.messages.no-columns')}
      </MessageStrip>
    );
  }

  return (
    <>
      <PathSelectorDialog
        show={showPathSelector}
        onCancel={() => setShowPathSelector(false)}
        onAdd={path => {
          console.log('would add', path);
          setShowPathSelector(false);
        }}
      />
      {columns.map(value => (
        <div key={value.path} className="columns-input">
          <Checkbox
            checked={value.isSelected}
            onChange={e => {
              value.isSelected = e.target.checked;
              setColumns([...columns]);
            }}
          />
          <ResourceForm.Wrapper
            resource={translations}
            setResource={setTranslations}
          >
            <Inputs.Text
              compact
              propertyPath={value.path}
              required
              placeholder={t('extensibility.starter-modal.headers.field-name')}
              readOnly={!value.isSelected}
            />
          </ResourceForm.Wrapper>
          <FormInput readOnly compact defaultValue={value?.path} />
          <Select
            selectedKey={value.widget}
            onSelect={(e, val) => {
              value.widget = val.key;
              setColumns([...columns]);
            }}
            options={Object.entries(widgets)
              .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
              .map(([key, widget]) => ({ key, text: key }))}
          />
        </div>
      ))}
      <Button glyph="add" onClick={() => setShowPathSelector(true)}>
        «add»
      </Button>
    </>
  );
}
