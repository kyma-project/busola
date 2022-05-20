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
        // TODO change not only metadata.name but metadata.labels['app.kubernetes.io/name'] as well
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
