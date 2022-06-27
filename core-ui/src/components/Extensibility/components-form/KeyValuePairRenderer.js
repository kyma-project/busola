import React from 'react';

import { KeyValueField } from 'shared/ResourceForm/fields';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function KeyValuePairRenderer({
  storeKeys,
  schema,
  value,
  onChange,
  required,
}) {
  const { tFromStoreKeys } = useGetTranslation();

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
      title={tFromStoreKeys(storeKeys)}
    />
  );
}
