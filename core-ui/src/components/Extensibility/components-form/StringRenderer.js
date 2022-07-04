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
  required,
  compact,
  ...props
}) {
  const { tFromStoreKeys } = useGetTranslation();

  if (schema.get('enum')) {
    const options = schema
      .get('enum')
      .toArray()
      .map(key => ({ key, text: key }));
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
            data: { value },
          });
        }}
        label={tFromStoreKeys(storeKeys)}
        input={Inputs.ComboboxInput}
        options={options}
        compact={compact}
      />
    );
  } else {
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
            data: { value },
          });
        }}
        label={tFromStoreKeys(storeKeys)}
        input={Inputs.Text}
        compact={compact}
      />
    );
  }
}
