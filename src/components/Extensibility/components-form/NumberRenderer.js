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
  editMode,
  ...props
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const schemaPlaceholder = schema.get('placeholder');

  const numberProps = Object.fromEntries(
    ['min', 'max'].map(prop => [prop, schema.get(prop)]),
  );

  const disableOnEdit = schema.get('disableOnEdit');
  console.log('NumbererRenderer editMode: ', editMode);

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
      label={tFromStoreKeys(storeKeys, schema)}
      placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
      data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
      input={Inputs.Number}
      compact={compact}
      disabled={disableOnEdit && editMode}
      {...numberProps}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
