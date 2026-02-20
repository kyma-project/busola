import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
  SchemaOnChangeParams,
} from 'components/Extensibility/helpers';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';
import { FormFieldProps } from 'shared/ResourceForm/components/FormField';

type SwitchRendererProps = {
  onChange: (params: SchemaOnChangeParams) => void;
  value: any;
  schema: StoreSchemaType;
  storeKeys: StoreKeys;
  required?: boolean;
  compact?: boolean;
  editMode?: boolean;
} & Omit<
  FormFieldProps,
  'label' | 'input' | 'required' | 'disabled' | 'tooltipContent' | 'inputInfo'
>;

export function SwitchRenderer({
  onChange,
  value,
  schema,
  storeKeys,
  required,
  compact,
  editMode,
  ...props
}: SwitchRendererProps) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const disableOnEdit = schema.get('disableOnEdit');

  return (
    <ResourceForm.FormField
      value={value}
      setValue={(value: any) => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
      }}
      label={tFromStoreKeys(storeKeys, schema)}
      data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
      input={Inputs.Switch}
      compact={compact}
      disabled={disableOnEdit && editMode}
      {...props}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
