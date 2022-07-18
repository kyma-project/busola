import React from 'react';
import { PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function GenericList2({
  storeKeys,
  setValue: onChange,
  value,
  schema,
  schemaKeys,
  showValidity,
  required,
  readOnly,
  level,
  childrenComponents,
  ...props
}) {
  const { t } = useTranslation();

  const listSize = value?.size || 0;

  const addItem = () => {
    //TODO do it based on the childrenComponents

    const newVal = value ? [...value] : [];
    newVal.push({ name: '', content: false });
    onChange(newVal);
  };
  console.log(childrenComponents);
  const removeItem = index => {
    onChange({
      storeKeys,
      scopes: ['value', 'internal'],
      type: 'list-item-delete',
      index,
      schema,
      required,
    });
  };

  // const { tFromStoreKeys } = useGetTranslation();

  return (
    <ResourceForm.CollapsibleSection
      container
      title={'tFromStoreKeys(storeKeys)'}
      actions={setOpen => (
        <Button
          glyph="add"
          compact
          onClick={() => {
            addItem();
            setOpen(true);
          }}
          disabled={readOnly}
        >
          {t('common.buttons.add')}
        </Button>
      )}
      {...props}
    >
      {Array(listSize)
        .fill(null)
        .map((_val, index) => {
          const ownKeys = storeKeys.push(index);
          const itemsSchema = schema.get('items');
          return (
            <ResourceForm.CollapsibleSection
              title={'tFromStoreKeys(ownKeys)'}
              actions={
                <Button
                  compact
                  glyph="delete"
                  type="negative"
                  onClick={() => removeItem(index)}
                  disabled={readOnly}
                />
              }
            >
              {/*<PluginStack*/}
              {/*  showValidity={showValidity}*/}
              {/*  schema={itemsSchema}*/}
              {/*  parentSchema={schema}*/}
              {/*  storeKeys={ownKeys}*/}
              {/*  level={level + 1}*/}
              {/*  schemaKeys={schemaKeys?.push('items')}*/}
              {/*/>*/}
            </ResourceForm.CollapsibleSection>
          );
        })}
    </ResourceForm.CollapsibleSection>
  );
}
