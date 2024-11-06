import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

export function NumberRenderer({
  onChange,
  value,
  schema,
  storeKeys,
  required,
  placeholder,
  editMode,
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const schemaPlaceholder = schema.get('placeholder');

  const numberProps = Object.fromEntries(
    ['min', 'max'].map(prop => [prop, schema.get(prop)]),
  );

  const disableOnEdit = schema.get('disableOnEdit');

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      let enumOptions = schema.toJS().enum;
      // if there's only 1 option, it will be not in an array
      if (typeof enumOptions === 'number') {
        enumOptions = [enumOptions];
      }
      if (!Array.isArray(enumOptions)) {
        if (enumOptions.key) {
          enumOptions = [enumOptions];
        } else {
          enumOptions = [];
        }
      }

      const displayOptions = enumOptions
        .filter(option => typeof option === 'number')
        .map(option => ({
          key: option,
          text: option,
        }));

      return {
        input: Inputs.ComboboxInput,
        options: displayOptions,
        isNumeric: true,
      };
    } else {
      return { input: Inputs.Number };
    }
  };

  return (
    <ResourceForm.FormField
      value={value}
      setValue={value => {
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
      placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
      data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
      disabled={disableOnEdit && editMode}
      {...numberProps}
      {...getTypeSpecificProps()}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
