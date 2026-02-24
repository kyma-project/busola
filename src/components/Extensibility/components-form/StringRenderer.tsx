import { Key, RefAttributes, useState } from 'react';
import {
  Button,
  InputDomRef,
  InputPropTypes,
  WithWebComponentPropTypes,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { base64Decode, base64Encode } from 'shared/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  getPropsFromSchema,
  OptionType,
  SchemaOnChangeParams,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';

type StringRendererProps = {
  onChange: (params: SchemaOnChangeParams) => void;
  value: any;
  schema: StoreSchemaType;
  storeKeys: StoreKeys;
  required?: boolean;
  placeholder?: string;
  editMode?: boolean;
  resource?: Record<string, any> | string;
  isListItem?: boolean;
};

export function StringRenderer({
  onChange,
  value,
  schema,
  storeKeys,
  required,
  placeholder,
  editMode,
  resource,
  isListItem,
}: StringRendererProps) {
  const { t } = useTranslation();
  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');
  const readOnly = schema.get('readOnly') ?? false;
  const decodable = schema.get('decodable');
  const disableOnEdit = schema.get('disableOnEdit');
  const [decoded, setDecoded] = useState(true);

  let decodeError = false;
  if (decodable) {
    try {
      if (value) {
        const decodedValue = base64Decode(value);
        if (decoded) value = decodedValue;
      }
    } catch (e) {
      console.warn('Base64 decode error', e);
      decodeError = true;
      if (decoded) setDecoded(false);
    }
  }

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      const translationPath = storeKeys
        .toArray()
        .filter((el) => typeof el === 'string')
        .join('.');

      let enumOptions = schema.toJS().enum;
      // if there's only 1 option, it will be not in an array
      if (typeof enumOptions === 'string') {
        enumOptions = [enumOptions];
      }
      if (!Array.isArray(enumOptions)) {
        if (enumOptions.key) {
          enumOptions = [enumOptions];
        } else {
          enumOptions = [];
        }
      }

      const displayOptions = enumOptions.map((option?: OptionType) => {
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
            ? tExt(option.name)
            : exists(`${translationPath}.${option?.key}`)
              ? tExt(`${translationPath}.${option?.key}`)
              : option?.key,
        };
      });

      return {
        input: schema.get('dropdownOnly')
          ? Inputs.Dropdown
          : Inputs.ComboboxInput,
        options: displayOptions,
      };
    } else if (!decodable) {
      return { input: Inputs.Text };
    } else {
      return {
        input: (
          params: InputPropTypes &
            WithWebComponentPropTypes &
            RefAttributes<InputDomRef> & { key: Key },
        ) => (
          <>
            <Inputs.Text {...params} />
            {decodable && (
              <div className="bsl-col-md--1">
                <Button
                  design="Transparent"
                  icon={decoded ? 'hide' : 'show'}
                  onClick={() => setDecoded(!decoded)}
                >
                  {decoded
                    ? t('secrets.buttons.encode')
                    : t('secrets.buttons.decode')}
                </Button>
              </div>
            )}
          </>
        ),
      };
    }
  };

  const displayPlaceholder =
    (decoded && tExt(schema.get('decodedPlaceholder'))) ||
    tExt(schemaPlaceholder) ||
    tExt(placeholder);

  return (
    <ResourceForm.Wrapper resource={resource}>
      <ResourceForm.FormField
        value={value}
        setValue={(value: any) => {
          if (decodable && decoded) {
            value = base64Encode(value);
          }
          if (onChange) {
            onChange({
              storeKeys,
              scopes: ['value'],
              type: 'set',
              schema,
              required,
              data: {
                value:
                  schema.get('format') === 'int-or-string'
                    ? isNaN(value)
                      ? value
                      : value.endsWith('.') || value.endsWith('.0')
                        ? value
                        : parseFloat(value)
                    : value,
              },
            });
          }
        }}
        disabled={readOnly || (disableOnEdit && editMode)}
        isListItem={isListItem}
        label={tFromStoreKeys(storeKeys, schema)}
        data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
        placeholder={displayPlaceholder}
        {...getTypeSpecificProps()}
        {...getPropsFromSchema(schema, required, tExt)}
        validate={() => !decodable || !decodeError}
        validateMessage={t('secrets.messages.decode-error')}
      />
    </ResourceForm.Wrapper>
  );
}
