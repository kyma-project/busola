import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function SwitchRenderer({
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
      data-testid={storeKeys.join('.')}
      input={Inputs.Switch}
      compact={compact}
    />
  );
}
