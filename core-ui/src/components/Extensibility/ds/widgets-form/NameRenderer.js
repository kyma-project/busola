import React from 'react';

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
        onChange({
          storeKeys,
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
