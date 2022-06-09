import React from 'react';

import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

export function StringRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  ...props
}) {
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
        label={<TransTitle schema={schema} storeKeys={storeKeys} />}
        input={Inputs.ComboboxInput}
        options={options}
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
        label={<TransTitle schema={schema} storeKeys={storeKeys} />}
        input={Inputs.Text}
      />
    );
  }
}
