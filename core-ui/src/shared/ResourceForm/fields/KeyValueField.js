import React, { useState } from 'react';
import { FormInput, Button } from 'fundamental-react';
import { Tooltip } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { base64Decode, base64Encode, readFromFile } from 'shared/helpers';

import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';

export function KeyValueField({
  actions = [],
  encodable = false,
  defaultOpen,
  isAdvanced,
  input = Inputs.Text,
  keyProps = {
    pattern: '([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
  },
  readableFromFile = false,
  lockedKeys = [],
  lockedValues = [],
  ...props
}) {
  const { t } = useTranslation();

  const [valuesEncoded, setValuesEncoded] = useState(false);
  const [decodeErrors, setDecodeErrors] = useState({});

  const toggleEncoding = () => {
    setDecodeErrors({});
    setValuesEncoded(!valuesEncoded);
  };

  const dataValue = value => {
    if (!encodable || valuesEncoded) {
      return value?.val || '';
    } else {
      try {
        return base64Decode(value?.val || '');
      } catch (e) {
        decodeErrors[value?.key] = e.message;
        setDecodeErrors({ ...decodeErrors });
        setValuesEncoded(true);
        return '';
      }
    }
  };

  if (encodable) {
    actions = [
      ...actions,
      <Button
        compact
        option="transparent"
        glyph={valuesEncoded ? 'show' : 'hide'}
        onClick={toggleEncoding}
      >
        {valuesEncoded
          ? t('secrets.buttons.decode')
          : t('secrets.buttons.encode')}
      </Button>,
    ];
  }

  return (
    <MultiInput
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
      toInternal={value =>
        Object.entries(value || {}).map(([key, val]) => ({ key, val }))
      }
      toExternal={value =>
        value
          .filter(entry => !!entry?.key)
          .reduce((acc, entry) => ({ ...acc, [entry.key]: entry.val }), {})
      }
      inputs={[
        ({ value, setValue, ref, updateValue, focus }) => (
          <FormInput
            compact
            disabled={lockedKeys.includes(value?.key)}
            key="key"
            value={value?.key || ''}
            ref={ref}
            onChange={e =>
              setValue({ val: value?.val || '', key: e.target.value })
            }
            onKeyDown={e => focus(e, 1)}
            onBlur={updateValue}
            {...keyProps}
            placeholder={t('components.key-value-field.enter-key')}
          />
        ),
        ({ focus, value, setValue, updateValue, ...props }) =>
          input({
            key: 'value',
            onKeyDown: e => focus(e),
            value: dataValue(value),
            placeholder: t('components.key-value-field.enter-value'),
            disabled: lockedValues.includes(value?.key),
            setValue: val => {
              setValue({
                ...value,
                val: valuesEncoded || !encodable ? val : base64Encode(val),
              });
              updateValue();
            },
            validationState:
              value?.key && decodeErrors[value.key]
                ? {
                    state: 'error',
                    text: t('secrets.messages.decode-error', {
                      message: decodeErrors[value.key],
                    }),
                  }
                : undefined,
            ...props,
          }),
        ({ value, setValue, updateValue }) =>
          readableFromFile ? (
            <Tooltip content={t('common.tooltips.read-file')}>
              <Button
                compact
                className="read-from-file"
                onClick={() =>
                  readFromFile().then(result => {
                    setValue({
                      key: value?.key || result.name,
                      val: !encodable
                        ? result.content
                        : base64Encode(result.content),
                    });
                    updateValue();
                  })
                }
              >
                {t('components.key-value-form.read-value')}
              </Button>
            </Tooltip>
          ) : null,
      ]}
      actions={actions}
      tooltipContent={t('common.tooltips.key-value')}
      {...props}
    />
  );
}
