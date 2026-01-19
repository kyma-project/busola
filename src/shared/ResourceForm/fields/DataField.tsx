import { useTranslation } from 'react-i18next';
import { TextArea } from '@ui5/webcomponents-react';

import { KeyValueField } from './KeyValueField';

type DataFieldProps = React.ComponentProps<typeof KeyValueField>;

export function DataField({ title, ...props }: DataFieldProps) {
  const { t } = useTranslation();
  return (
    <KeyValueField
      readableFromFile
      title={title || t('common.labels.data')}
      keyProps={{
        pattern: '([A-Za-z0-9.][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
      }}
      input={{
        value: ({ setValue, ...inputProps }) => (
          <TextArea
            onChange={(e) => setValue(e.target.value)}
            growing
            growingMaxRows={10}
            {...inputProps}
          />
        ),
      }}
      {...props}
    />
  );
}
