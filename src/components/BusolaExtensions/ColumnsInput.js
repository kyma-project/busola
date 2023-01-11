import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, Checkbox, MessageStrip } from 'fundamental-react';

export function ColumnsInput({ value: columns, setValue: setColumns }) {
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
        <FormInput
          compact
          value={value.name}
          onChange={e => {
            value.name = e.target.value;
            setColumns([...columns]);
          }}
          required
          placeholder={t('extensibility.starter-modal.headers.field-name')}
          readOnly={!value.isSelected}
        />
        <FormInput readOnly compact defaultValue={value?.path} />
        <FormInput readOnly compact defaultValue={value?.type} />
      </div>
    );
  });
}
