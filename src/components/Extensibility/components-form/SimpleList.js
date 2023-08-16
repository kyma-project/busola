import React from 'react';
import { mapValues } from 'lodash';
import { PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button } from '@ui5/webcomponents-react';
import { FormLabel } from 'fundamental-react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  useCreateResourceDescription,
  useGetTranslation,
} from 'components/Extensibility/helpers';

import { ResourceForm } from 'shared/ResourceForm';
import { Label } from '../../../shared/ResourceForm/components/Label';
import { Icon } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

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
  nestingLevel = 0,
  ...props
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};
  const listSize = value?.size || 0;
  const schemaPlaceholder = schema.get('placeholder');
  const inputInfo = useCreateResourceDescription(schema.get('inputInfo'));
  const tooltipContent = schema.get('description');
  const defaultOpen = schema.get('defaultExpanded') ?? false;

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
      required={required}
      nestingLevel={nestingLevel}
      {...props}
    >
      <div className="fd-row simple-list">
        <div className="fd-col fd-col-md--3 fd-margin-bottom--sm form-field__label">
          <Label required={required} tooltipContent={tExt(tooltipContent)}>
            {tFromStoreKeys(storeKeys, schema)}
          </Label>
        </div>
        <div className="fd-col fd-col-md--8 form-field multi-input extensibility">
          <ul className={listClasses}>
            {isObject && (
              <li className="fd-row">
                <div className="fd-col-md--11 list-entry">
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
                    nestingLevel={nestingLevel + 1}
                    schemaKeys={schemaKeys?.push('items')}
                  />
                </div>
                <div className="fd-col fd-col-md--1">
                  <span className="item-action"></span>
                </div>
              </li>
            )}
            {Array(listSize + 1)
              .fill(null)
              .map((_val, index) => {
                const ownKeys = storeKeys.push(index);

                return (
                  <>
                    <li key={index} className="fd-row">
                      <div className="fd-col fd-col-md--11 list-entry">
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
                      </div>
                      <div className="fd-col fd-col-md--1">
                        <span className="item-action">
                          {!isLast(index) && (
                            <Button
                              design="Negative"
                              disabled={readOnly}
                              icon="delete"
                              onClick={() => removeItem(index)}
                            />
                          )}
                        </span>
                      </div>
                    </li>
                    {isLast(index) && inputInfo && (
                      <p
                        style={{
                          color: 'var(--sapNeutralTextColor)',
                          margin: '0',
                        }}
                      >
                        {inputInfo}
                      </p>
                    )}
                  </>
                );
              })}
          </ul>
        </div>
        <div className="fd-col fd-col-md--1 tooltip-column tooltip-column--with-padding">
          {tooltipContent && (
            <Tooltip className="has-tooltip" delay={0} content={tooltipContent}>
              <Icon ariaLabel="" size="m" glyph="message-information" />
            </Tooltip>
          )}
        </div>
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
