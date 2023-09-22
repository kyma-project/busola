import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextArea } from '@ui5/webcomponents-react';

import { KeyValueField } from './KeyValueField';

import './DataField.scss';

export function DataField({ title, ...props }) {
  const { t } = useTranslation();
  console.log('props', props);
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
          <TextArea
            onChange={e => setValue(e.target.value)}
            growing
            growingMaxLines={'10'}
            {...props}
          />
        ),
      }}
      {...props}
    />
  );
}
