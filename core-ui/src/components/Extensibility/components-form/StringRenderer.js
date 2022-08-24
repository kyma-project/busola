import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { fromJS } from 'immutable';

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
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      const options = fromJS(schema.get('enum'))
        .toArray()
        .map(key => ({ key, text: key }));
      return { input: Inputs.ComboboxInput, options };
    } else {
      return { input: Inputs.Text };
    }
  };

  const schemaPlaceholder = schema.get('placeholder');

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
      placeholder={schemaPlaceholder ? tExt(schemaPlaceholder) : placeholder}
      compact={compact}
      required={required}
      data-testid={storeKeys.join('.')}
      {...getTypeSpecificProps()}
    />
  );
}
