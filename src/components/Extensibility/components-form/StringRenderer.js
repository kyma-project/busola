import React, { useState } from 'react';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { base64Decode, base64Encode } from 'shared/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';

export function StringRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  placeholder,
  originalResource,
  ...props
}) {
  const { t } = useTranslation();
  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');
  const readOnly = schema.get('readOnly') ?? false;
  const decodable = schema.get('decodable');
  const [decoded, setDecoded] = useState(true);

  let decodeError = false;
  if (decodable) {
    try {
      if (value) {
        const decodedValue = base64Decode(value);
        if (decoded) value = decodedValue;
      }
    } catch (e) {
      decodeError = true;
      if (decoded) setDecoded(false);
    }
  }

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      let enumOptions = schema.toJS().enum;
      // if there's only 1 option, it will be not in an array
      if (typeof enumOptions === 'string') {
        enumOptions = [enumOptions];
      }
      if (!Array.isArray(enumOptions)) {
        enumOptions = [];
      }

      const options = enumOptions.map(key => ({
        key,
        text: tExt(key),
      }));
      return { input: Inputs.ComboboxInput, options };
    } else if (!decodable) {
      return { input: Inputs.Text };
    } else {
      return {
        input: params => (
          <>
            <Inputs.Text {...params} />
            {decodable && (
              <div className="fd-col fd-col-md--1 generate-button">
                <Button
                  compact
                  option="transparent"
                  glyph={decoded ? 'hide' : 'show'}
                  iconBeforeText
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
    <ResourceForm.Wrapper resource={props?.resource}>
      <ResourceForm.FormField
        value={value}
        setValue={value => {
          if (decodable && decoded) {
            value = base64Encode(value);
          }
          onChange &&
            onChange({
              storeKeys,
              scopes: ['value'],
              type: 'set',
              schema,
              required,
              data: { value },
            });
        }}
        disabled={readOnly}
        label={tFromStoreKeys(storeKeys, schema)}
        compact={compact}
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
