import { useTranslation } from 'react-i18next';
import { TextArea } from '@ui5/webcomponents-react';

import { KeyValueField } from './KeyValueField';

export function DataField({ title, ...props }) {
  const { t } = useTranslation();
  return (
    <KeyValueField
      fullWidth
      readableFromFile
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
