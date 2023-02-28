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
      keyProps={{
        pattern: '([A-Za-z0-9.][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
      }}
      input={{
        value: ({ setValue, ...props }) => (
          <FormTextarea
            compact
            onChange={e => setValue(e.target.value)}
            className="value-textarea"
            {...props}
            onKeyDown={() => {}} // overwrites default onKeyDown that switches focus when Enter is pressed
          />
        ),
      }}
      {...props}
    />
  );
}
