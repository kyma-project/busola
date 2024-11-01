import React from 'react';
import { useState } from 'react';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

export function NumberRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  placeholder,
  editMode,
  ...props
}) {
  const { t } = useTranslation();
  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();

  const schemaPlaceholder = schema.get('placeholder');
  const decodable = schema.get('decodable');
  const [decoded, setDecoded] = useState(true);

  const numberProps = Object.fromEntries(
    ['min', 'max'].map(prop => [prop, schema.get(prop)]),
  );

  const disableOnEdit = schema.get('disableOnEdit');

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      const translationPath = storeKeys
        .toArray()
        .filter(el => typeof el === 'number')
        .join('.');

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

      const displayOptions = enumOptions.map(option => {
        if (typeof option === 'number') {
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
          key: option.key,
          text: option.name
            ? tExt(option.name)
            : exists(`${translationPath}.${option.key}`)
            ? tExt(`${translationPath}.${option.key}`)
            : option.key,
        };
      });

      return { input: Inputs.ComboboxInput, options: displayOptions };
    } else if (!decodable) {
      return { input: Inputs.Text };
    } else {
      return {
        input: params => (
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
      input={Inputs.Number}
      compact={compact}
      disabled={disableOnEdit && editMode}
      {...numberProps}
      {...getTypeSpecificProps()}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
