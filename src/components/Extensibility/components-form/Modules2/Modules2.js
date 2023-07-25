import React, { useState } from 'react';
import { PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import { useGetTranslation } from 'components/Extensibility/helpers';
import pluralize from 'pluralize';
import { fromJS } from 'immutable';
import {
  CheckBox,
  ComboBox,
  ComboBoxItem,
  FlexBox,
} from '@ui5/webcomponents-react';

export function Modules2({
  storeKeys,
  onChange,
  schema,
  schemaKeys,
  showValidity,
  required,
  readOnly,
  level,
  nestingLevel = 0,
  ...props
}) {
  const { t } = useTranslation();
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  const listSize = value?.size || 0;
  const schemaPlaceholder = schema.get('placeholder');
  const itemTemplate = schema.get('template') || {};
  const defaultOpen = schema.get('defaultExpanded');
  const [newItemIndex, setNewItemIndex] = useState(0);

  const addItem = itemTemplate => {
    onChange({
      storeKeys,
      scopes: ['value', 'internal'],
      type: 'list-item-add',
      schema,
      itemValue: fromJS(itemTemplate),
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
      defaultOpen={defaultOpen}
      container
      title={tFromStoreKeys(storeKeys, schema)}
      nestingLevel={nestingLevel}
      required={required}
      {...props}
    >
      {Array(listSize)
        .fill(null)
        .map((_val, index) => {
          const ownKeys = storeKeys?.push(index);
          const itemsSchema = schema.get('items');
          console.log(itemsSchema.toJS());
          console.log(ownKeys.toJS());
          return (
            <FlexBox
              alignItems="Center"
              direction="Row"
              justifyContent="SpaceBetween"
              wrap="Wrap"
              fitContainer
            >
              <PluginStack
                showValidity={showValidity}
                schema={itemsSchema}
                parentSchema={schema}
                storeKeys={ownKeys}
                level={level + 1}
                schemaKeys={schemaKeys?.push('items')}
                placeholder={tExt(schemaPlaceholder)}
                nestingLevel={nestingLevel + 1}
              />
            </FlexBox>
          );
        })}
    </ResourceForm.CollapsibleSection>
  );
}
