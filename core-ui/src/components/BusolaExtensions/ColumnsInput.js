import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormInput,
  Checkbox,
  Select,
  MessageStrip,
  Button,
} from 'fundamental-react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

import { PathSelectorDialog } from './PathSelectorDialog';

const flatPath = path => path.replace(/\[]/g, '');

export function ColumnsInput({
  value: columns,
  setValue: setColumns,
  translations,
  setTranslations,
  widgets = {},
  schema,
}) {
  const { t } = useTranslation();
  const [showPathSelector, setShowPathSelector] = useState(false);

  const addPath = (path, name) => {
    setColumns([...columns, { path }]);
    jp.value(translations, `$.${flatPath(path)}`, name);
    setTranslations({ ...translations });
  };

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
        schema={schema}
        onCancel={() => setShowPathSelector(false)}
        onAdd={addPath}
      />
      {columns.map(value => (
        <div key={value.path} className="columns-input">
          <Button
            glyph="delete"
            option="transparent"
            onClick={() => setColumns(columns.filter(col => col !== value))}
          />
          {/*
          <Checkbox
            checked={value.isSelected}
            onChange={e => {
              value.isSelected = e.target.checked;
              setColumns([...columns]);
            }}
          />
          */}
          <ResourceForm.Wrapper
            resource={translations}
            setResource={setTranslations}
          >
            <Inputs.Text
              compact
              propertyPath={flatPath(value.path)}
              required
              placeholder={t('extensibility.starter-modal.headers.field-name')}
              // readOnly={!value.isSelected}
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
