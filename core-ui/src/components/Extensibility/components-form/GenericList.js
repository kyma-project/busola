import React from 'react';
import { PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';
import pluralize from 'pluralize';

export function GenericList({
  storeKeys,
  onChange,
  schema,
  schemaKeys,
  showValidity,
  required,
  readOnly,
  level,
  ...props
}) {
  const { t } = useTranslation();
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  const listSize = value?.size || 0;
  const schemaPlaceholder = schema.get('placeholder');

  const addItem = () => {
    onChange({
      storeKeys,
      scopes: ['value', 'internal'],
      type: 'list-item-add',
      schema,
      required,
    });
  };

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

  return (
    <ResourceForm.CollapsibleSection
      container
      title={tFromStoreKeys(storeKeys, schema)}
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
              title={pluralize(tFromStoreKeys(ownKeys, schema), 1)}
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
              <PluginStack
                showValidity={showValidity}
                schema={itemsSchema}
                parentSchema={schema}
                storeKeys={ownKeys}
                level={level + 1}
                schemaKeys={schemaKeys?.push('items')}
                placeholder={schemaPlaceholder && tExt(schemaPlaceholder)}
              />
            </ResourceForm.CollapsibleSection>
          );
        })}
    </ResourceForm.CollapsibleSection>
  );
}
