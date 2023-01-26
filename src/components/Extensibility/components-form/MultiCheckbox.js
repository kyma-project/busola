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
  ...props
}) {
  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();

  if (!schema.get('options')) {
    return null;
  }

  const schemaPlaceholder = schema.get('placeholder');
  const readOnly = schema.get('readOnly') ?? false;

  const value = getValue(storeKeys, resource);

  const getCheckboxesOptions = () => {
    const translationPath = storeKeys
      .toArray()
      .filter(el => typeof el === 'string')
      .join('.');

    let options = schema.toJS().options;
    // if there's only 1 option, it will be not in an array
    if (typeof options === 'string') {
      options = [options];
    }
    if (!Array.isArray(options)) {
      options = [];
    }
    const displayOptions = options.map(option => {
      if (typeof option === 'string') {
        return {
          key: option,
          text: exists(translationPath + '.' + option)
            ? tExt(translationPath + '.' + option)
            : option,
        };
      }
      let defaultText = exists(translationPath + '.' + option.key)
        ? tExt(translationPath + '.' + option.key)
        : option.key;

      if (option.name) {
        defaultText = exists(translationPath + '.' + option.name)
          ? tExt(translationPath + '.' + option.name)
          : option.name;
      }
      return {
        key: option.key,
        text: defaultText,
        description: exists(translationPath + '.' + option.description)
          ? tExt(translationPath + '.' + option.description)
          : option.description,
      };
    });
    return {
      input: Inputs.Checkboxes,
      options: displayOptions,
    };
  };

  return (
    <ResourceForm.Wrapper resource={resource}>
      <ResourceForm.FormField
        value={value}
        setValue={value => {
          if (!onChange) return;
          onChange({
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value },
          });
        }}
        validate={() => value?.length}
        disabled={readOnly}
        label={tFromStoreKeys(storeKeys, schema)}
        compact={compact}
        dataTestID={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
        placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
        {...getCheckboxesOptions()}
        {...getPropsFromSchema(schema, required, tExt)}
      />
    </ResourceForm.Wrapper>
  );
}
