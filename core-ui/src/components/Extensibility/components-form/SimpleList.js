import React from 'react';
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
  const fullWidth = false; // TODO

  console.log('widgets', widgets);

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

  const listClasses = classnames({
    'text-array-input__list': true,
    'fd-col': true,
    'fd-col-md--7': !fullWidth,
    'fd-col-md--12': fullWidth,
  });

  return (
    <ResourceForm.CollapsibleSection
      container
      title={<TransTitle schema={schema} storeKeys={storeKeys} />}
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
      <div className="fd-row form-field multi-input">
        <ul className={listClasses}>
          {Array(listSize)
            .fill(null)
            .map((_val, index) => {
              const ownKeys = storeKeys.push(index);
              const itemsSchema = schema.get('items');

              /*
        return (
          <ResourceForm.CollapsibleSection
            title={<TransTitle schema={schema} storeKeys={ownKeys} />}
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
            />
          </ResourceForm.CollapsibleSection>
        );
        */
              return (
                <li>
                  <PluginStack
                    showValidity={showValidity}
                    schema={itemsSchema}
                    /*
            widgets={{
              ...widgets,
              types: {
                string: () => 'string',
                integer: () => 'integer',
                number: () => 'number',
                boolean: () => 'boolean',
              }
            }}
            */
                    parentSchema={schema}
                    storeKeys={ownKeys}
                    level={level + 1}
                    schemaKeys={schemaKeys?.push('items')}
                    // WidgetOverride={({children}) => <React.Fragment container="true">{children}</React.Fragment>}
                    compact
                  />
                  <Button
                    disabled={readOnly}
                    compact
                    glyph="delete"
                    type="negative"
                    onClick={() => removeItem(index)}
                    ariaLabel={t('common.buttons.delete')}
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </ResourceForm.CollapsibleSection>
  );
}
