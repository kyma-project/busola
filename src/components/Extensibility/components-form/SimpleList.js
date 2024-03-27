import { mapValues } from 'lodash';
import { PluginStack, useUIStore } from '@ui-schema/ui-schema';
import { Button, FlexBox, Label as UI5Label } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import {
  useCreateResourceDescription,
  useGetTranslation,
} from 'components/Extensibility/helpers';

import { ResourceForm } from 'shared/ResourceForm';
import { Label } from '../../../shared/ResourceForm/components/Label';
import { spacing } from '@ui5/webcomponents-react-base';

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

  const isLast = index => index === listSize;
  const itemsSchema = schema.get('items');
  const titleRenderer = ({ schema, storeKeys }) => {
    const label = tFromStoreKeys(storeKeys, schema);
    return <UI5Label>{label}</UI5Label>;
  };

  const isObject = itemsSchema?.get('type') === 'object';

  return (
    <ResourceForm.CollapsibleSection
      defaultOpen={defaultOpen}
      container
      title={tFromStoreKeys(storeKeys, schema)}
      required={required}
      nestingLevel={nestingLevel}
      tooltipContent={tExt(tooltipContent)}
      {...props}
    >
      <div className="bsl-col-md--12 multi-input">
        <ul>
          {isObject && (
            <li>
              <FlexBox alignItems="Center">
                <div className="bsl-col-md--12 simple-list ">
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
              </FlexBox>
            </li>
          )}
          {Array(listSize + 1)
            .fill(null)
            .map((_val, index) => {
              const ownKeys = storeKeys.push(index);

              return (
                <>
                  <li key={index}>
                    <FlexBox alignItems="Center">
                      <div className="bsl-col-md--11 simple-list ">
                        <PluginStack
                          showValidity={showValidity}
                          schema={itemsSchema}
                          parentSchema={schema}
                          storeKeys={ownKeys}
                          level={level + 1}
                          schemaKeys={schemaKeys?.push('items')}
                          placeholder={tExt(schemaPlaceholder)}
                          isListItem
                          inputInfo={inputInfo}
                        />
                      </div>
                      {!isLast(index) && (
                        <Button
                          disabled={readOnly}
                          style={spacing.sapUiTinyMarginTop}
                          icon="delete"
                          design="Transparent"
                          onClick={() => removeItem(index)}
                          aria-label={t('common.buttons.delete')}
                        />
                      )}
                    </FlexBox>
                  </li>
                  {isLast(index) && inputInfo && (
                    <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
                      {inputInfo}
                    </Label>
                  )}
                </>
              );
            })}
        </ul>
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
