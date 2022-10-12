import React from 'react';
import { mapValues } from 'lodash';
import { PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button, FormLabel } from 'fundamental-react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useGetTranslation } from 'components/Extensibility/helpers';

import { ResourceForm } from 'shared/ResourceForm';
import { Label } from '../../../shared/ResourceForm/components/Label';

import './SimpleList.scss';

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
  lvl = 0,
  ...props
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  const listSize = value?.size || 0;
  const schemaPlaceholder = schema.get('placeholder');
  const schemaRequired = schema.get('required');
  const inputInfo = schema.get('inputInfo');
  const tooltipContent = schema.get('description');
  const defaultOpen = schema.get('defaultExpanded');

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
  const titleRenderer = ({ schema, storeKeys }) => {
    const label = tFromStoreKeys(storeKeys, schema);
    return <FormLabel>{label}</FormLabel>;
  };

  const isObject = itemsSchema?.get('type') === 'object';

  return (
    <ResourceForm.CollapsibleSection
      defaultOpen={defaultOpen}
      container
      title={tFromStoreKeys(storeKeys, schema)}
      required={schemaRequired ?? required}
      lvl={lvl}
      {...props}
    >
      <div className="fd-row simple-list">
        <div className="fd-col fd-col-md--3 fd-margin-bottom--sm">
          <Label
            required={schemaRequired ?? required}
            tooltipContent={tExt(tooltipContent)}
          >
            {tFromStoreKeys(storeKeys, schema)}
          </Label>
        </div>
        <div className="fd-col fd-col-md--8 form-field multi-input extensibility">
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
                  lvl={lvl + 1}
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
                  <>
                    <li key={index}>
                      <PluginStack
                        showValidity={showValidity}
                        schema={itemsSchema}
                        parentSchema={schema}
                        storeKeys={ownKeys}
                        level={level + 1}
                        schemaKeys={schemaKeys?.push('items')}
                        compact
                        placeholder={tExt(schemaPlaceholder)}
                        inputInfo={inputInfo}
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
                    {isLast(index) && inputInfo && (
                      <p
                        style={{
                          color: 'var(--sapNeutralTextColor)',
                          margin: '0 8px',
                        }}
                      >
                        {tExt(inputInfo)}
                      </p>
                    )}
                  </>
                );
              })}
          </ul>
        </div>
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
