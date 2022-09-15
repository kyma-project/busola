import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

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
  const { tFromStoreKeys, tryTranslate } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      const translationPath = storeKeys
        .toArray()
        .filter(el => typeof el === 'string')
        .join('.');
      const options = schema.toJS().enum.map(key => ({
        key,
        text: tryTranslate(translationPath + '.' + key) || key,
      }));
      return { input: Inputs.ComboboxInput, options };
    } else {
      return { input: Inputs.Text };
    }
  };

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
      compact={compact}
      data-testid={storeKeys.join('.')}
      placeholder={tryTranslate(schemaPlaceholder) || tryTranslate(placeholder)}
      {...getTypeSpecificProps()}
      {...getPropsFromSchema(schema, required, tryTranslate)}
    />
  );
}
