import React from 'react';
import { FormTextarea } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { KeyValueField } from './KeyValueField';

import './DataField.scss';

export function DataField({ title, ...props }) {
  const { t } = useTranslation();

  return (
    <KeyValueField
      fullWidth
      readableFromFile
      className="resource-form__data-field"
      title={title || t('common.labels.data')}
      input={({ value, setValue, ...props }) => (
        <FormTextarea
          compact
          key="value"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={t('components.key-value-field.enter-value')}
          className="value-textarea"
          {...props}
        />
      )}
      {...props}
    />
  );
}
