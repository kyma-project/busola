import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import {
  Button,
  FormInput,
  FormTextarea,
  ComboboxInput,
} from 'fundamental-react';
import { Tooltip } from 'react-shared';

import { useMicrofrontendContext } from 'react-shared';
import { base64Decode, base64Encode } from 'shared/helpers';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import {
  MultiInput,
  K8sNameField,
  KeyValueField,
} from 'shared/ResourceForm/components/FormComponents';

import {
  createSecretTemplate,
  createPresets,
  readFromFile,
  getSecretDefs,
} from './helpers';

import './CreateSecretForm.scss';

export function CreateSecretForm({
  namespaceId,
  formElementRef,
  onChange,
  secret: existingSecret,
  onSubmit,
}) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState(
    existingSecret || createSecretTemplate(namespaceId),
  );
  const [valuesEncoded, setValuesEncoded] = useState(false);
  const [decodeErrors, setDecodeErrors] = useState({});
  const [lockedKeys, setLockedKeys] = useState([]);

  const microfrontendContext = useMicrofrontendContext();

  const secretDefs = getSecretDefs(t, microfrontendContext);
  const type = secret?.type;
  const currentDef =
    type === 'Opaque' ? {} : secretDefs.find(def => def.type === type);
  const secretTypes = Array.from(
    new Set(secretDefs.map(secret => secret.type)),
  );

  useEffect(() => {
    setLockedKeys(currentDef?.data || []);
    setSecret({
      ...secret,
      data: {
        ...(currentDef?.data || []).reduce(
          (acc, key) => ({ ...acc, [key]: '' }),
          {},
        ),
        ...(secret.data || {}),
      },
    });
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDecodeValues = () => {
    setDecodeErrors({});
    setValuesEncoded(!valuesEncoded);
  };

  const dataValue = value => {
    if (valuesEncoded) {
      return value?.val;
    } else {
      try {
        return base64Decode(value?.val || '');
      } catch (e) {
        decodeErrors[value.key] = e.message;
        setDecodeErrors(decodeErrors);
        setValuesEncoded(true);
        return '';
      }
    }
  };

  return (
    <ResourceForm
      className="create-secret-form"
      pluralKind="secrets"
      singularName={t('secrets.name_singular')}
      resource={secret}
      setResource={setSecret}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/api/v1/namespaces/${namespaceId}/secrets/`}
      presets={createPresets(secretDefs, namespaceId, t)}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('secrets.name_singular')}
        setValue={name => {
          jp.value(secret, '$.metadata.name', name);
          jp.value(secret, "$.metadata.labels['app.kubernetes.io/name']", name);
          setSecret({ ...secret });
        }}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceForm.FormField
        propertyPath="$.type"
        label={t('secrets.type')}
        input={({ value, setValue }) => (
          <ComboboxInput
            required
            compact
            placeholder={t('secrets.placeholders.type')}
            options={secretTypes.map(type => ({ key: type, text: type }))}
            value={secret.type}
            selectedKey={secret.type}
            onSelect={e => setValue(e.target.value)}
          />
        )}
      />
      <MultiInput
        fullWidth
        propertyPath="$.data"
        title={t('secrets.data')}
        isEntryLocked={entry => (currentDef?.data || []).includes(entry.key)}
        toInternal={value =>
          Object.entries(value || {}).map(([key, val]) => ({ key, val }))
        }
        toExternal={value =>
          value
            .filter(entry => !!entry?.key)
            .reduce((acc, entry) => ({ ...acc, [entry.key]: entry.val }), {})
        }
        inputs={[
          ({ value, setValue, ref, onBlur, focus }) => (
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
              onBlur={onBlur}
              placeholder={t('components.key-value-field.enter-key')}
            />
          ),
          ({ value, setValue, ref, onBlur, focus }) => (
            <FormTextarea
              compact
              key="value"
              value={dataValue(value)}
              ref={ref}
              onChange={e =>
                setValue({
                  ...value,
                  val: valuesEncoded
                    ? e.target.value
                    : base64Encode(e.target.value),
                })
              }
              onKeyDown={e => focus(e)}
              onBlur={onBlur}
              placeholder={t('components.key-value-field.enter-value')}
              className="value-textarea"
              validationState={
                value?.key &&
                decodeErrors[value.key] && {
                  state: 'error',
                  text: t('secrets.messages.decode-error', {
                    message: decodeErrors[value.key],
                  }),
                }
              }
            />
          ),
          ({ value, setValue }) => (
            <Tooltip content={t('common.tooltips.read-file')}>
              <Button
                compact
                className="read-from-file"
                onClick={() =>
                  readFromFile().then(result =>
                    setValue({
                      key: value?.key || result.name,
                      val: base64Encode(result.content),
                    }),
                  )
                }
              >
                {t('components.key-value-form.read-value')}
              </Button>
            </Tooltip>
          ),
        ]}
        actions={[
          <Button
            compact
            option="transparent"
            glyph={valuesEncoded ? 'show' : 'hide'}
            onClick={toggleDecodeValues}
          >
            {valuesEncoded
              ? t('secrets.buttons.decode')
              : t('secrets.buttons.encode')}
          </Button>,
        ]}
      />
    </ResourceForm>
  );
}
