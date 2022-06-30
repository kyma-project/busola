import React from 'react';
import { mapValues } from 'lodash';
import { TransTitle, PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button } from 'fundamental-react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';

export function SimpleList({
  storeKeys,
  onChange,
  schema,
  schemaKeys,
  showValidity,
  required,
  readOnly,
  level,
  widgets,
  ...props
}) {
  const { t } = useTranslation();
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  const listSize = value?.size || 0;

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

  const listClasses = classnames([
    'text-array-input__list',
    'fd-col',
    'fd-col-md--12',
  ]);

  const isLast = index => index === listSize;
  const itemsSchema = schema.get('items');
  const titleRenderer = ({ schema, storeKeys }) => (
    <label>
      <TransTitle schema={schema} storeKeys={storeKeys} />
    </label>
  );

  const isObject = itemsSchema.get('type') === 'object';

  return (
    <ResourceForm.CollapsibleSection
      container
      title={<TransTitle schema={schema} storeKeys={storeKeys} />}
      {...props}
    >
      <div className="fd-row form-field multi-input extensibility">
        <ul className={listClasses}>
          {isObject && (
            <li>
              <PluginStack
                schema={itemsSchema}
                widgets={{
                  ...widgets,
                  types: mapValues(widgets.types, () => titleRenderer),
                  custom: {
                    ...mapValues(widgets.custom, () => titleRenderer),
                    Null: () => '',
                  },
                }}
                parentSchema={schema}
                storeKeys={storeKeys.push(0)}
                level={level + 1}
                schemaKeys={schemaKeys?.push('items')}
              />
              <span className="item-action"></span>
            </li>
          )}
          {Array(listSize + 1)
            .fill(null)
            .map((_val, index) => {
              const ownKeys = storeKeys.push(index);

              return (
                <li>
                  <PluginStack
                    showValidity={showValidity}
                    schema={itemsSchema}
                    parentSchema={schema}
                    storeKeys={ownKeys}
                    level={level + 1}
                    schemaKeys={schemaKeys?.push('items')}
                    compact
                  />
                  <span className="item-action">
                    {!isLast(index) && (
                      <Button
                        disabled={readOnly}
                        compact
                        glyph="delete"
                        type="negative"
                        onClick={() => removeItem(index)}
                        ariaLabel={t('common.buttons.delete')}
                      />
                    )}
                  </span>
                </li>
              );
            })}
        </ul>
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
