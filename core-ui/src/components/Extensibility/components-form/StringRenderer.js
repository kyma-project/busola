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
  placeholder,
  ...props
}) {
  const { t, tFromStoreKeys } = useGetTranslation();

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      const options = schema
        .get('enum')
        .toArray()
        .map(key => ({ key, text: key }));
      return { input: Inputs.ComboboxInput, options };
    } else {
      return { input: Inputs.Text };
    }
  };
  const ownPlaceholder = schema.get('placeholder');

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
      placeholder={
        ownPlaceholder
          ? t(ownPlaceholder, { defaultValue: placeholder })
          : placeholder
      }
      label={tFromStoreKeys(storeKeys, schema)}
      compact={compact}
      required={required}
      data-testid={storeKeys.join('.')}
      {...getTypeSpecificProps()}
    />
  );
}
