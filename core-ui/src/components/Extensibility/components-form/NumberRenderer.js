import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function NumberRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  placeholder,
  ...props
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const schemaPlaceholder = schema.get('placeholder');
  const schemaRequired = schema.get('required');

  return (
    <ResourceForm.FormField
      value={value}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value: value || undefined },
        });
      }}
      label={tFromStoreKeys(storeKeys, schema)}
      placeholder={schemaPlaceholder ? tExt(schemaPlaceholder) : placeholder}
      data-testid={storeKeys.join('.')}
      input={Inputs.Number}
      compact={compact}
      required={schemaRequired ?? required}
    />
  );
}
