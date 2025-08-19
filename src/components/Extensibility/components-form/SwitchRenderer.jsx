import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

export function SwitchRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  editMode,
  ...props
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const disableOnEdit = schema.get('disableOnEdit');

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
      data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
      input={Inputs.Switch}
      compact={compact}
      disabled={disableOnEdit && editMode}
      {...props}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
