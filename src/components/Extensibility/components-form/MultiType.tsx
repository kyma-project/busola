import { SegmentedButton, SegmentedButtonItem } from '@ui5/webcomponents-react';
import { PluginStack, StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';
import { isNil } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import {
  SchemaOnChangeParams,
  useGetTranslation,
} from 'components/Extensibility/helpers';

type MultiTypeProps = {
  onChange: (params: SchemaOnChangeParams) => void;
  schema: StoreSchemaType;
  storeKeys: StoreKeys;
  resource: Record<string, any>;
} & Record<string, any>;

type TypeOption = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

export function MultiType({
  onChange,
  schema,
  storeKeys,
  resource,
  ...props
}: MultiTypeProps) {
  const value = storeKeys.reduce((val, key) => val?.[key], resource);
  const { tFromStoreKeys } = useGetTranslation();

  const types = schema.get('type');
  const typeWidgets = schema.get('widgets')?.toJS();

  let newSchema = schema.delete('type').delete('widget').delete('widgets');

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
        data-testid={
          storeKeys.join('.')
            ? `${storeKeys.join('.')}-type`
            : tFromStoreKeys(storeKeys, schema)
        }
        input={() => (
          <SegmentedButton>
            {types.map((type: TypeOption) => (
              <SegmentedButtonItem
                key={type}
                selected={type === selectedType}
                onClick={() => {
                  if (onChange) {
                    onChange({
                      storeKeys,
                      scopes: ['value'],
                      type: 'set',
                      schema,
                      required: false,
                      data: { value: defaults[type] },
                    });
                  }
                }}
              >
                {tFromStoreKeys(storeKeys.push(type), schema)}
              </SegmentedButtonItem>
            ))}
          </SegmentedButton>
        )}
      />
      <PluginStack
        {...props}
        /*@ts-expect-error Type mismatch or probably no longer used*/
        onChange={onChange}
        schema={newSchema}
        storeKeys={storeKeys}
      />
    </>
  );
}
