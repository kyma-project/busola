import React from 'react';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

import { KeyValueField } from 'shared/ResourceForm/fields';

export function KeyValuePairRenderer({
  storeKeys,
  schema,
  value,
  onChange,
  required,
}) {
  return (
    <KeyValueField
      value={value}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
      }}
      title={<TransTitle schema={schema} storeKeys={storeKeys} />}
    />
  );
}
