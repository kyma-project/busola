import React from 'react';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { ResourceForm } from 'shared/ResourceForm';
import { widgetList } from 'components/Extensibility/components-form/index';

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
  componentSpec,
  ...props
}) {
  const { t } = useTranslation();
  console.log(componentSpec);
  const { children: childrenComponents, path } = componentSpec;
  const listSize = value?.length || 0;

  const addItem = () => {
    //TODO do it based on the childrenComponents
    const newVal = Array.isArray(value) ? [...value] : [];
    newVal.push({ name: '', content: 'false' });
    onChange(newVal);
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
              {childrenComponents?.map(child => {
                //TODO do it based on the childrenComponents
                const fieldSpec = schema.properties.spec.properties.files;
                const childSpec = fieldSpec.items.properties[child.path];
                const Component = widgetList[childSpec.type];

                return (
                  <Component
                    value={value[index][child.path]}
                    setValue={v => {
                      const newVal = [...value];
                      jp.value(newVal, `$[${index}].${child.path}`, v);
                      onChange(newVal);
                    }}
                    label={`${path}.${child.path}`}
                  />
                );
              })}
            </ResourceForm.CollapsibleSection>
          );
        })}
    </ResourceForm.CollapsibleSection>
  );
}
