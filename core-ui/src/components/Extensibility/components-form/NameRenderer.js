import React from 'react';
import { List } from 'immutable';

import { K8sNameField } from 'shared/ResourceForm/fields';

export function NameRenderer({
  storeKeys,
  resource,
  value,
  onChange,
  schema,
  required,
}) {
  return (
    <K8sNameField
      value={value}
      kind={resource.kind}
      setValue={value => {
        console.log('storeKeys', storeKeys);
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
        onChange({
          storeKeys: List(['metadata', 'labels', 'app.kubernetes.io/name']),
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
      }}
      validate={value => !!value}
    />
  );
}
