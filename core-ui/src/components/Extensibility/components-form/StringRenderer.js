import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function StringRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  compact,
  ...props
}) {
  const { tFromStoreKeys } = useGetTranslation();

  const enumValue = schema.get('enum');
  const options = enumValue
    ? enumValue.toArray().map(key => ({ key, text: key }))
    : null;

  const isRequired = schema.get('required');

  return (
    <ResourceForm.FormField
      value={value}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          data: { value },
        });
      }}
      label={tFromStoreKeys(storeKeys)}
      input={enumValue ? Inputs.ComboboxInput : Inputs.Text}
      options={options}
      compact={compact}
      required={isRequired}
    />
  );
}
