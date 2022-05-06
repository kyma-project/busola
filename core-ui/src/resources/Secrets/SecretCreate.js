import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { ComboboxInput } from 'fundamental-react';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  DataField,
} from 'shared/ResourceForm/fields';

import { createSecretTemplate, createPresets, getSecretDefs } from './helpers';

import './SecretCreate.scss';

export function SecretCreate({
  namespaceId,
  formElementRef,
  onChange,
  resource: initialSecret,
  resourceUrl,
  setCustomValid,
  prefix,
  ...props
}) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState(
    initialSecret ? { ...initialSecret } : createSecretTemplate(namespaceId),
  );
  const [lockedKeys, setLockedKeys] = useState([]);

  const microfrontendContext = useMicrofrontendContext();

  const secretDefs = getSecretDefs(t, microfrontendContext);
  const type = secret?.type;
  const currentDef =
    type === 'Opaque' ? {} : secretDefs.find(def => def.type === type);
  const secretTypes = Array.from(
    new Set(secretDefs.map(secret => secret.type || 'Opaque')),
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

  return (
    <ResourceForm
      {...props}
      className="create-secret-form"
      pluralKind="secrets"
      singularName={t('secrets.name_singular')}
      resource={secret}
      initialResource={initialSecret}
      setResource={setSecret}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      presets={!initialSecret && createPresets(secretDefs, namespaceId, t)}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        readOnly={!!initialSecret}
        propertyPath="$.metadata.name"
        kind={t('secrets.name_singular')}
        setValue={name => {
          jp.value(secret, '$.metadata.name', name);
          jp.value(secret, "$.metadata.labels['app.kubernetes.io/name']", name);
          setSecret({ ...secret });
        }}
        validate={value => !!value}
        prefix={prefix}
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
        required
        propertyPath="$.type"
        label={t('secrets.type')}
        input={({ value, setValue }) => (
          <ComboboxInput
            id="secrets-type-combobox"
            ariaLabel="Secret's type's Combobox"
            required
            compact
            placeholder={t('secrets.placeholders.type')}
            options={secretTypes.map(type => ({ key: type, text: type }))}
            selectedKey={value}
            typedValue={value}
            onSelect={e => setValue(e.target.value)}
            disabled={!!initialSecret}
          />
        )}
      />
      <DataField
        defaultOpen
        encodable
        propertyPath="$.data"
        lockedKeys={lockedKeys}
      />
    </ResourceForm>
  );
}
SecretCreate.allowEdit = true;
