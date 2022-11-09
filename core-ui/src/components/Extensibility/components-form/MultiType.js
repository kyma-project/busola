import React from 'react';
import { ButtonSegmented, Button } from 'fundamental-react';
import { PluginStack } from '@ui-schema/ui-schema';
import { isNil } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
// import { getObjectValueWorkaround } from 'components/Extensibility/helpers';

import { useGetTranslation } from 'components/Extensibility/helpers';

export function MultiType({
  onChange,
  // value,
  schema,
  storeKeys,
  required,
  resource,
  ...props
}) {
  console.log('MultiType::store keys', storeKeys.toJS());
  const value = storeKeys.reduce((val, key) => val?.[key], resource);

  console.log('MultiType::resource', resource);
  console.log('MultiType::value', typeof value, value);
  console.log('MultiType::schema', schema);
  // const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();
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
    array: [],
    object: {},
    boolean: false,
    null: undefined,
  };

  return (
    <>
      «{selectedType}»
      <ResourceForm.FormField
        value={value}
        label={tFromStoreKeys(storeKeys, schema)}
        data-testid={`${storeKeys.join('.')}-type`}
        // placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
        input={() => (
          <ButtonSegmented>
            {types.map(type => (
              <Button
                compact
                key={type}
                selected={type === selectedType}
                onClick={() => {
                  console.log('onClick?', type, defaults[type]);
                  onChange &&
                    onChange({
                      storeKeys,
                      scopes: ['value'],
                      type: 'set',
                      schema,
                      required,
                      data: { value: defaults[type] },
                    });
                }}
              >
                {type}
              </Button>
            ))}
          </ButtonSegmented>
        )}
      />
      <PluginStack
        // showValidity={showValidity}
        onChange={onChange}
        schema={newSchema}
        // parentSchema={schema}
        storeKeys={storeKeys}
        resource={resource}
        // level={level + 1}
        // schemaKeys={schemaKeys?.push('items')}
        // compact
        // placeholder={tExt(schemaPlaceholder)}
        // inputInfo={inputInfo}
        {...props}
      />
      {/*type !== 'null' && <ResourceForm.FormField
        value={value}
        setValue={value => {
          onChange && onChange({
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
        placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
        {...getTypeSpecificProps()}
        {...getPropsFromSchema(schema, required, tExt)}
      />*/}
    </>
  );
}
