import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
  SchemaOnChangeParams,
  OptionType,
} from 'components/Extensibility/helpers';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';

type MultiCheckboxProps = {
  onChange?: (params: SchemaOnChangeParams) => void;
  schema: StoreSchemaType;
  storeKeys: StoreKeys;
  required?: boolean;
  resource?: Record<string, any>;
  compact?: boolean;
  placeholder?: string;
};

function getValue(storeKeys: StoreKeys, resource?: Record<string, any>) {
  let value = resource;
  const keys = storeKeys.toJS();
  keys.forEach((key) => (value = value?.[key]));
  return value;
}

export function MultiCheckbox({
  onChange,
  schema,
  storeKeys,
  required,
  resource,
  compact,
  placeholder,
}: MultiCheckboxProps) {
  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();

  if (!schema.get('options')) {
    return null;
  }

  const schemaPlaceholder = schema.get('placeholder');
  const readOnly = schema.get('readOnly') ?? false;

  const value = getValue(storeKeys, resource);

  const getCheckboxesOptions = () => {
    const translationPath = storeKeys
      .toArray()
      .filter((el) => typeof el === 'string')
      .join('.');

    let options = schema.toJS().options;
    // if there's only 1 option, it will be not in an array
    if (typeof options === 'string') {
      options = [options];
    }
    if (!Array.isArray(options)) {
      options = [];
    }
    const displayOptions = options.map((option?: OptionType) => {
      if (typeof option === 'string') {
        return {
          key: option,
          text: exists(option)
            ? tExt(option)
            : exists(`${translationPath}.${option}`)
              ? tExt(`${translationPath}.${option}`)
              : option,
        };
      }

      return {
        key: option?.key,
        text: option?.name
          ? tExt(option?.name)
          : exists(`${translationPath}.${option?.key}`)
            ? tExt(`${translationPath}.${option?.key}`)
            : option?.key,
        description: option?.description
          ? exists(option?.description)
            ? tExt(option?.description)
            : exists(`${translationPath}.${option?.description}`)
              ? tExt(`${translationPath}.${option?.description}`)
              : option?.description
          : null,
      };
    });
    return {
      input: Inputs.Checkboxes,
      options: displayOptions,
    };
  };

  return (
    <ResourceForm.Wrapper resource={resource}>
      <ResourceForm.FormField
        value={value}
        setValue={(value: string) => {
          if (!onChange) return;
          onChange({
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value },
          });
        }}
        className="multi-checkbox"
        validate={() => value?.length}
        disabled={readOnly}
        label={tFromStoreKeys(storeKeys, schema)}
        compact={compact}
        dataTestID={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
        placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
        {...getCheckboxesOptions()}
        {...getPropsFromSchema(schema, required, tExt)}
      />
    </ResourceForm.Wrapper>
  );
}
