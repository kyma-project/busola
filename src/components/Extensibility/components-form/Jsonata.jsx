import { ResourceForm } from 'shared/ResourceForm';
import {
  getPropsFromSchema,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { Icon, Input } from '@ui5/webcomponents-react';
import { t } from 'i18next';

export function JsonataInput({ value, setValue, onChange, ...props }) {
  if (!props.readOnly) delete props.readOnly;

  return (
    <Input
      value={value || ''}
      {...props}
      onInput={onChange ?? ((e) => setValue && setValue(e.target.value))}
      icon={<Icon accessibleName="Jsonata" name="source-code" />}
    />
  );
}

export function Jsonata({
  onChange,
  value,
  schema,
  storeKeys,
  required,
  compact,
  placeholder,
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');

  return (
    <ResourceForm.FormField
      value={value}
      setValue={(value) => {
        if (onChange) {
          onChange({
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value },
          });
        }
      }}
      label={tFromStoreKeys(storeKeys, schema)}
      compact={compact}
      data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
      placeholder={
        tExt(schemaPlaceholder) ||
        tExt(placeholder) ||
        t('common.placeholders.enter-jsonata')
      }
      input={JsonataInput}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
