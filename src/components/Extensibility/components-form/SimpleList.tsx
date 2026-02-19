import {
  PluginStack,
  StoreKeys,
  StoreSchemaType,
  useUIStore,
} from '@ui-schema/ui-schema';
import { Button, FlexBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import {
  SchemaOnChangeParams,
  useCreateResourceDescription,
  useGetTranslation,
} from 'components/Extensibility/helpers';

import { ResourceForm } from 'shared/ResourceForm';
import { Label } from '../../../shared/ResourceForm/components/Label';
import { CollapsibleSectionProps } from 'shared/ResourceForm/components/CollapsibleSection';

type SimpleListProps = {
  storeKeys: StoreKeys;
  onChange: (params: SchemaOnChangeParams) => void;
  schema: StoreSchemaType;
  schemaKeys: StoreKeys;
  showValidity?: boolean;
  required?: boolean;
  readOnly?: boolean;
  level?: number;
  nestingLevel?: number;
} & Omit<
  CollapsibleSectionProps,
  | 'children'
  | 'title'
  | 'defaultOpen'
  | 'required'
  | 'tooltipContent'
  | 'nestingLevel'
>;

export function SimpleList({
  storeKeys,
  onChange,
  schema,
  schemaKeys,
  showValidity,
  required,
  readOnly,
  level = 0,
  nestingLevel = 0,
  ...props
}: SimpleListProps) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { t } = useTranslation();
  const { store } = useUIStore();
  const { value } = (store?.extractValues(storeKeys) || {}) as {
    value: { size?: number };
  };
  const listSize = value?.size || 0;
  const schemaPlaceholder = schema.get('placeholder');
  const inputInfo = useCreateResourceDescription(schema.get('inputInfo'));
  const tooltipContent = schema.get('description');
  const defaultOpen = schema.get('defaultExpanded') ?? false;

  const removeItem = (index: number) => {
    onChange({
      storeKeys,
      scopes: ['value', 'internal'],
      type: 'list-item-delete',
      index,
      schema,
      required,
    });
  };

  const isLast = (index: number) => index === listSize;
  const itemsSchema = schema.get('items');

  return (
    <ResourceForm.CollapsibleSection
      defaultOpen={defaultOpen}
      title={tFromStoreKeys(storeKeys, schema)}
      required={required}
      nestingLevel={nestingLevel}
      tooltipContent={tExt(tooltipContent)}
      {...props}
    >
      <ul className="multi-input">
        {Array(listSize + 1)
          .fill(null)
          .map((_val, index) => {
            const ownKeys = storeKeys.push(index);
            return (
              <li key={index}>
                <FlexBox alignItems="Center">
                  <div className="bsl-col-md--11 simple-list">
                    <PluginStack
                      showValidity={showValidity}
                      schema={itemsSchema}
                      parentSchema={schema}
                      storeKeys={ownKeys}
                      level={level + 1}
                      /*@ts-expect-error Some type mismatch or probably no longer used*/
                      schemaKeys={schemaKeys?.push('items')}
                      placeholder={tExt(schemaPlaceholder)}
                      isListItem
                      inputInfo={inputInfo}
                    />
                  </div>
                  {!isLast(index) && (
                    <Button
                      disabled={readOnly}
                      className="sap-margin-top-tiny"
                      icon="delete"
                      design="Transparent"
                      onClick={() => removeItem(index)}
                      accessibleName={t('common.buttons.delete')}
                    />
                  )}
                </FlexBox>
                {isLast(index) && inputInfo && (
                  <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
                    {inputInfo}
                  </Label>
                )}
              </li>
            );
          })}
      </ul>
    </ResourceForm.CollapsibleSection>
  );
}
