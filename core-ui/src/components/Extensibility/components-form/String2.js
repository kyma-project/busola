import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function String2({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  setValue,
  propertyPath,
  ...props
}) {
  return (
    <ResourceForm.FormField
      value={value}
      setValue={setValue}
      // setValue={value => {
      //   onChange({
      //     storeKeys,
      //     scopes: ['value'],
      //     type: 'set',
      //     schema,
      //     required,
      //     data: { value },
      //   });
      // }}
      label={propertyPath}
      input={Inputs.Text}
      compact={compact}
    />
  );
}
