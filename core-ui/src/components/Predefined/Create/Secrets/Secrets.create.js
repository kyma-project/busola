import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { ComboboxInput } from 'fundamental-react';

import { useMicrofrontendContext } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  DataField,
} from 'shared/ResourceForm/components/FormComponents';

import { createSecretTemplate, createPresets, getSecretDefs } from './helpers';

import './SecretsCreate.scss';

function SecretsCreate({
  namespaceId,
  formElementRef,
  onChange,
  secret: initialSecret,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState(
    initialSecret || createSecretTemplate(namespaceId),
  );
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

  return (
    <ResourceForm
      className="create-secret-form"
      pluralKind="secrets"
      singularName={t('secrets.name_singular')}
      resource={secret}
      initialResource={initialSecret}
      setResource={setSecret}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
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
        required
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
      <DataField
        defaultOpen
        encodable
        propertyPath="$.data"
        lockedKeys={lockedKeys}
      />
    </ResourceForm>
  );
}
SecretsCreate.secrets = (t, context) => [
  {
    type: 'kubernetes.io/service-account-token',
    data: [],
    metadata: {
      annotations: {
        'kubernetes.io/service-account.name': '',
      },
    },
  },
  {
    type: 'kubernetes.io/dockercfg',
    data: ['.dockercfg'],
  },
  {
    type: 'kubernetes.io/dockerconfigjson',
    data: ['.dockerconfigjson'],
  },
  {
    type: 'kubernetes.io/basic-auth',
    data: ['username', 'password'],
  },
  {
    type: 'kubernetes.io/ssh-auth',
    data: ['ssh-privatekey'],
  },
  {
    type: 'kubernetes.io/tls',
    data: ['tls.crt', 'tls.key'],
  },
  {
    type: 'bootstrap.kubernetes.io/token',
    data: ['token-id', 'token-secret'],
  },
];
export { SecretsCreate };
