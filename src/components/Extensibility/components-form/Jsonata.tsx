import { ResourceForm } from 'shared/ResourceForm';
import {
  getPropsFromSchema,
  SchemaOnChangeParams,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import {
  Icon,
  Input,
  InputDomRef,
  Ui5CustomEvent,
} from '@ui5/webcomponents-react';
import { t } from 'i18next';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';

type JsonataInputProps = {
  value: string;
  setValue?: (value: string) => void;
  onChange?: (e: Ui5CustomEvent<InputDomRef>) => void;
  readOnly?: boolean;
} & Record<string, any>;

type JsonataProps = {
  value: string;
  onChange?: (params: SchemaOnChangeParams) => void;
  schema: StoreSchemaType;
  storeKeys: StoreKeys;
  required?: boolean;
  compact?: boolean;
  placeholder?: string;
};

export function JsonataInput({
  value,
  setValue,
  onChange,
  ...props
}: JsonataInputProps) {
  if (!props.readOnly) delete props.readOnly;

  return (
    <Input
      value={value || ''}
      {...props}
      onInput={onChange ?? ((e) => setValue?.(e.target.value))}
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
}: JsonataProps) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');

  return (
    <ResourceForm.FormField
      value={value}
      setValue={(value: string) => {
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
