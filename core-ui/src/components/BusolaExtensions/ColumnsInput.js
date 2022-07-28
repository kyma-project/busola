import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, Checkbox, Select, MessageStrip } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import * as jp from 'jsonpath';

export function ColumnsInput({
  value: columns,
  setValue: setColumns,
  translations,
  setTranslations,
  widgets = {},
}) {
  const { t } = useTranslation();

  if (!columns?.length) {
    return (
      <MessageStrip type="warning">
        {t('extensibility.starter-modal.messages.no-columns')}
      </MessageStrip>
    );
  }

  return columns.map(value => {
    return (
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
            console.log('setValue', value, val);
            value.widget = val.key;
            setColumns([...columns]);
          }}
          options={Object.entries(widgets)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([key, widget]) => ({ key, text: key }))}
        />
      </div>
    );
  });
}
