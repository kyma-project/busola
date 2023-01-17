import React from 'react';

import { base64Decode, base64Encode } from 'shared/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

export function StringRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  placeholder,
  originalResource,
  ...props
}) {
  const { itemVars } = useVariables();
  const jsonata = useJsonata({
    resource: originalResource,
    scope: value,
    value,
  });

  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');
  const readOnly = schema.get('readOnly') ?? false;
  const [decoded] = jsonata(
    schema.get('decoded'),
    itemVars(originalResource, schema.get('itemVars'), storeKeys),
  );

  if (decoded) {
    try {
      value = base64Decode(value);
    } catch (e) {
      // noop
    }
  }

  const getTypeSpecificProps = () => {
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
      return { input: Inputs.ComboboxInput, options };
    } else {
      return { input: Inputs.Text };
    }
  };

  return (
    <ResourceForm.FormField
      value={value}
      setValue={value => {
        if (decoded) {
          value = base64Encode(value);
        }
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
      {...getTypeSpecificProps()}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
