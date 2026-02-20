import { Fragment, useState } from 'react';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { base64Decode, base64Encode, readFromFile } from 'shared/helpers';

import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';

import './KeyValueField.scss';

type InputProp = {
  key?: (props: any) => React.ReactNode;
  value?: (props: any) => React.ReactNode;
};

type KeyValueFieldProps = {
  actions?: React.ReactNode[];
  encodable?: boolean;
  defaultOpen?: boolean;
  input?: InputProp;
  initialValue?: string | Record<string, any>;
  readableFromFile?: boolean;
  keyProps?: Record<string, any>;
  lockedKeys?: string[];
  lockedValues?: string[];
  required?: boolean;
  disableOnEdit?: boolean;
  editMode?: boolean;
  [key: string]: any;
};

export function KeyValueField({
  actions = [],
  encodable = false,
  defaultOpen,
  input = {} as InputProp,
  keyProps = {
    pattern: '([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]',
  },
  initialValue = '',
  readableFromFile = false,
  lockedKeys = [],
  lockedValues = [],
  required,
  disableOnEdit,
  editMode,
  ...props
}: KeyValueFieldProps) {
  const { t } = useTranslation();
  const [valuesEncoded, setValuesEncoded] = useState(false);
  const [decodeErrors, setDecodeErrors] = useState<{ [key: string]: any }>({});
  input = {
    key: input.key ?? Inputs.Text,
    value: input.value ?? Inputs.Text,
  };

  const toggleEncoding = () => {
    setDecodeErrors({});
    setValuesEncoded(!valuesEncoded);
  };

  const dataValue = (value?: { val?: string; key?: string }) => {
    if (!encodable || valuesEncoded) {
      return value?.val || initialValue;
    } else {
      try {
        return base64Decode(value?.val || '');
      } catch (e) {
        const newDecodeErrors: { [key: string]: any } = { ...decodeErrors };
        if (e instanceof Error && value?.key) {
          newDecodeErrors[value?.key] = e.message;
        }
        setDecodeErrors(newDecodeErrors);
        setValuesEncoded(true);
        return '';
      }
    }
  };

  if (encodable) {
    actions = [
      ...actions,
      <Button
        key="button-encode"
        design="Transparent"
        icon={valuesEncoded ? 'show' : 'hide'}
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
      toInternal={(value: { [key: string]: any }) =>
        Object.entries(value || {}).map(([key, val]) => ({ key, val }))
      }
      toExternal={(value: { [key: string]: any }) =>
        value
          .filter((entry: { key: any; val: any }) => !!entry?.key)
          .reduce(
            (acc: { [key: string]: any }, entry: { key: any; val: any }) => ({
              ...acc,
              [entry.key]: entry.val,
            }),
            {},
          )
      }
      inputs={[
        ({ value, setValue, ref, updateValue, focus, index }: any) => (
          <div
            key={`key-value-field-key-${index}`}
            className={readableFromFile ? 'bsl-col-md--4' : 'bsl-col-md--6'}
          >
            {input.key?.({
              fullWidth: true,
              className: 'full-width',
              disabled:
                lockedKeys.includes(value?.key) || (disableOnEdit && editMode),
              key: 'key',
              value: value?.key || '',
              ref: ref,
              onChange: (e: Event) =>
                setValue({
                  val: value?.val || initialValue,
                  key: (e?.target as HTMLInputElement)?.value,
                }),
              onKeyDown: (e: Event) => focus(e, 1),
              onBlur: updateValue,
              placeholder: t('components.key-value-field.enter-key'),
              accessibleName: `${props.title} key`,
              ...keyProps,
            })}
          </div>
        ),
        ({
          focus,
          value,
          setValue,
          updateValue,
          index,
          ...valueProps
        }: any) => (
          <div
            key={`key-value-field-value-${index}`}
            className={readableFromFile ? 'bsl-col-md--5' : 'bsl-col-md--6'}
          >
            {input.value?.({
              fullWidth: true,
              className: 'value-input full-width',
              key: 'value',
              onKeyDown: (e: Event) => focus(e),
              value: dataValue(value),
              placeholder: t('components.key-value-field.enter-value'),
              disabled:
                lockedValues.includes(value?.key) ||
                (disableOnEdit && editMode),
              setValue: (val: any) => {
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
              accessibleName: `${props.title} value`,
              ...valueProps,
            })}
          </div>
        ),
        ({ value, setValue, updateValue, index }: any) => (
          <Fragment key={`read-file-button-${index}`}>
            {readableFromFile ? (
              <Button
                onClick={() =>
                  readFromFile()?.then((result) => {
                    setValue({
                      key: value?.key || result.name,
                      val: !encodable
                        ? result.content
                        : base64Encode(result.content),
                    });
                    updateValue();
                  })
                }
                tooltip={t('common.tooltips.read-file')}
              >
                {t('components.key-value-form.read-value')}
              </Button>
            ) : null}
          </Fragment>
        ),
      ]}
      actions={actions}
      required={required}
      disableOnEdit={disableOnEdit}
      editMode={editMode}
      {...props}
    />
  );
}
