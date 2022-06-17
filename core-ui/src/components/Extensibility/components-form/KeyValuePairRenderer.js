import React from 'react';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

import { KeyValueField } from 'shared/ResourceForm/fields';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';

export function KeyValuePairRenderer({
  storeKeys,
  schema,
  value,
  onChange,
  required,
}) {
  return (
    <KeyValueField
      value={value ? Object.fromEntries(value) : {}}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value: createOrderedMap(value) },
        });
      }}
      title={<TransTitle schema={schema} storeKeys={storeKeys} />}
    />
  );
}
