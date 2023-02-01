import React, { useState } from 'react';
import { Button } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

import { base64Decode, base64Encode, readFromFile } from 'shared/helpers';

import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';

import './KeyValueField.scss';

export function KeyValueField({
  actions = [],
  encodable = false,
  defaultOpen,
  isAdvanced,
  input = {},
  keyProps = {
    pattern: '([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
  },
  initialValue = '',
  readableFromFile = false,
  lockedKeys = [],
  lockedValues = [],
  required,
  ...props
}) {
  const { t } = useTranslation();
  const [valuesEncoded, setValuesEncoded] = useState(false);
  const [decodeErrors, setDecodeErrors] = useState({});
  input = {
    key: Inputs.Text,
    value: Inputs.Text,
    ...input,
  };

  const toggleEncoding = () => {
    setDecodeErrors({});
    setValuesEncoded(!valuesEncoded);
  };

  const dataValue = value => {
    if (!encodable || valuesEncoded) {
      return value?.val || initialValue;
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
        iconBeforeText
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
          <div className="fd-col fd-col-md--6">
            {input.key({
              fullWidth: true,
              disabled: lockedKeys.includes(value?.key),
              key: 'key',
              value: value?.key || '',
              ref: ref,
              onChange: e =>
                setValue({
                  val: value?.val || initialValue,
                  key: e.target.value,
                }),
              onKeyDown: e => focus(e, 1),
              onBlur: updateValue,
              placeholder: t('components.key-value-field.enter-key'),
              ...keyProps,
            })}
          </div>
        ),
        ({ focus, value, setValue, updateValue, ...props }) => (
          <div className="fd-col fd-col-md--6">
            {input.value({
              fullWidth: true,
              className: 'value-input',
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
            })}
          </div>
        ),
        ({ value, setValue, updateValue }) => (
          <div className="fd-col fd-col-md--6">
            {readableFromFile ? (
              <Tooltip content={t('common.tooltips.read-file')}>
                <Button
                  compact
                  className="read-from-file"
                  onClick={() =>
                    readFromFile()?.then(result => {
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
            ) : null}
          </div>
        ),
      ]}
      actions={actions}
      required={required}
      {...props}
    />
  );
}
