import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

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
  const { tFromStoreKeys, tryTranslate } = useGetTranslation();

  const schemaPlaceholder = schema.get('placeholder');

  const numberProps = Object.fromEntries(
    ['min', 'max'].map(prop => [prop, schema.get(prop)]),
  );

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
          data: { value: value ?? undefined },
        });
      }}
      label={tFromStoreKeys(storeKeys, schema)}
      placeholder={tryTranslate(schemaPlaceholder) || tryTranslate(placeholder)}
      data-testid={storeKeys.join('.')}
      input={Inputs.Number}
      compact={compact}
      {...numberProps}
      {...getPropsFromSchema(schema, required, tryTranslate)}
    />
  );
}
