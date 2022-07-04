import React, { useRef } from 'react';
import { List } from 'immutable';

import { K8sNameField } from 'shared/ResourceForm/fields';

export function NameRenderer({
  storeKeys,
  resource,
  value,
  onChange,
  schema,
  required,
  ...props
}) {
  const extraPaths = schema.get('extraPaths')?.toJS() || [];
  const nameRef = useRef(resource?.metadata?.name);

  return (
    <K8sNameField
      readOnly={!!nameRef.current}
      value={value}
      kind={resource.kind}
      setValue={value => {
        onChange([
          {
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value },
          },
          ...extraPaths.map(path => ({
            storeKeys: List(Array.isArray(path) ? path : path.split('.')),
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value },
          })),
        ]);
      }}
      validate={value => !!value}
    />
  );
}
