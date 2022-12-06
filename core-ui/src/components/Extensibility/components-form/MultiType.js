import React from 'react';
import { ButtonSegmented, Button } from 'fundamental-react';
import { PluginStack } from '@ui-schema/ui-schema';
import { isNil } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { useGetTranslation } from 'components/Extensibility/helpers';

export function MultiType({
  onChange,
  schema,
  storeKeys,
  required,
  resource,
  ...props
}) {
  const value = storeKeys.reduce((val, key) => val?.[key], resource);

  const { tFromStoreKeys } = useGetTranslation();

  const types = schema.get('type');
  const typeWidgets = schema.get('widgets')?.toJS();

  let newSchema = schema
    .delete('type')
    .delete('widget')
    .delete('widgets');

  let selectedType;
  if (isNil(value)) {
    selectedType = 'null';
  } else if (Array.isArray(value)) {
    selectedType = 'array';
  } else {
    selectedType = typeof value;
  }

  newSchema = newSchema
    .set('type', selectedType)
    .set('widget', typeWidgets?.[selectedType]);

  const defaults = {
    string: '',
    number: 0,
    array: [],
    object: {},
    boolean: false,
    null: undefined,
  };

  return (
    <>
      <ResourceForm.FormField
        value={value}
        label={tFromStoreKeys(storeKeys, schema)}
        data-testid={`${storeKeys.join('.')}-type`}
        input={() => (
          <ButtonSegmented>
            {types.map(type => (
              <Button
                compact
                key={type}
                selected={type === selectedType}
                onClick={() => {
                  onChange &&
                    onChange({
                      storeKeys,
                      scopes: ['value'],
                      type: 'set',
                      schema,
                      required: false,
                      data: { value: defaults[type] },
                    });
                }}
              >
                {tFromStoreKeys(storeKeys.push(type), schema)}
              </Button>
            ))}
          </ButtonSegmented>
        )}
      />
      <PluginStack
        {...props}
        onChange={onChange}
        schema={newSchema}
        storeKeys={storeKeys}
        resource={resource}
      />
    </>
  );
}
