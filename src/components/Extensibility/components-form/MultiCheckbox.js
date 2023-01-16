import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

function getValue(storeKeys, resource) {
  let value = resource;
  const keys = storeKeys.toJS();
  keys.forEach(key => (value = value?.[key]));
  return value;
}

export function MultiCheckbox({
  onChange,
  // value,  //<-- doesn't work
  schema,
  storeKeys,
  required,

  resource,
  compact,
  placeholder,
}) {
  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');
  const readOnly = schema.get('readOnly') ?? false;
  const value = getValue(storeKeys, resource);

  const getCheckboxesOptions = () => {
    if (schema.get('enum')) {
      const translationPath = storeKeys
        .toArray()
        .filter(el => typeof el === 'string')
        .join('.');

      let enumOptions = schema.toJS().enum;
      // if there's only 1 option, it will be not in an array
      if (typeof enumOptions === 'string') {
        enumOptions = [enumOptions];
      }
      if (!Array.isArray(enumOptions)) {
        enumOptions = [];
      }

      const options = enumOptions.map(key => ({
        key,
        text: exists(translationPath + '.' + key)
          ? tExt(translationPath + '.' + key)
          : key,
      }));
      console.log('options', options);
      return {
        input: Inputs.Checkboxes,
        options,
      };
    } else {
      return {
        input: Inputs.Switch,
      };
    }
  };

  return (
    <ResourceForm.FormField
      value={value}
      setValue={value => {
        console.log('value', value);
        onChange &&
          onChange({
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value },
          });
      }}
      disabled={readOnly}
      label={tFromStoreKeys(storeKeys, schema)}
      compact={compact}
      data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
      placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
      {...getCheckboxesOptions()}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
