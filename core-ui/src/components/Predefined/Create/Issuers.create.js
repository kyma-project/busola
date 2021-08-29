import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  Select,
  Checkbox,
} from 'fundamental-react';
import { usePost, useNotification } from 'react-shared';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

function PrivateKeyForm({ issuer, setIssuer, disabled }) {
  const { t } = useTranslation();

  return (
    <>
      <FormFieldset>
        <CreateForm.FormField
          label={
            <FormLabel required={!disabled}>
              {t('issuers.private-key-name')}
            </FormLabel>
          }
          input={
            <FormInput
              compact
              value={issuer.privateKeyName}
              disabled={disabled}
              required={!disabled}
              onChange={e =>
                setIssuer({ ...issuer, privateKeyName: e.target.value })
              }
            />
          }
        />
      </FormFieldset>
      <FormFieldset>
        <CreateForm.FormField
          label={
            <FormLabel required={!disabled}>
              {t('issuers.private-key-namespace')}
            </FormLabel>
          }
          input={
            <FormInput
              compact
              disabled={disabled}
              required={!disabled}
              value={issuer.privateKeyNamespace}
              onChange={e =>
                setIssuer({ ...issuer, privateKeyNamespace: e.target.value })
              }
            />
          }
        />
      </FormFieldset>
    </>
  );
}

function SimpleForm({ issuer, setIssuer }) {
  const { t, i18n } = useTranslation();

  let issuerTypeFields;
  if (issuer.type === 'ca') {
    issuerTypeFields = (
      <CreateForm.Section>
        <PrivateKeyForm issuer={issuer} setIssuer={setIssuer} />
      </CreateForm.Section>
    );
  } else if (issuer.type === 'acme') {
    issuerTypeFields = (
      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel required>{t('issuers.server')}</FormLabel>}
            input={
              <FormInput
                required
                compact
                value={issuer.server}
                onChange={e => setIssuer({ ...issuer, server: e.target.value })}
              />
            }
          />
        </FormFieldset>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel required>{t('issuers.email')}</FormLabel>}
            input={
              <FormInput
                required
                compact
                value={issuer.email}
                onChange={e => setIssuer({ ...issuer, email: e.target.value })}
              />
            }
          />
        </FormFieldset>
      </CreateForm.Section>
    );
  }

  return (
    <>
      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel required>{t('common.labels.name')}</FormLabel>}
            input={
              <FormInput
                compact
                required
                onChange={e => setIssuer({ ...issuer, name: e.target.value })}
                value={issuer.name}
                i18n={i18n}
              />
            }
          />
        </FormFieldset>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel required>{t('issuers.type')}</FormLabel>}
            input={
              <Select
                required
                compact
                onSelect={(e, { key }) => setIssuer({ ...issuer, type: key })}
                options={[
                  { key: 'ca', text: t('issuers.ca') },
                  { key: 'acme', text: t('issuers.acme') },
                ]}
                selectedKey={issuer.type}
              ></Select>
            }
          />
        </FormFieldset>
      </CreateForm.Section>
      {issuerTypeFields}
    </>
  );
}

function AdvancedForm({ issuer, setIssuer }) {
  const { t, i18n } = useTranslation();

  let issuerTypeFields;
  if (issuer.type === 'acme') {
    issuerTypeFields = (
      <>
        <CreateForm.CollapsibleSection
          title={t('issuers.private-key')}
          actions={
            <Checkbox
              compact
              checked={issuer.autoRegistration}
              onChange={(e, checked) =>
                setIssuer({ ...issuer, autoRegistration: checked })
              }
              dir="rtl"
            >
              {t('issuers.auto-registration')}
            </Checkbox>
          }
        >
          <PrivateKeyForm
            issuer={issuer}
            setIssuer={setIssuer}
            disabled={issuer.autoRegistration}
          />
        </CreateForm.CollapsibleSection>
        <CreateForm.CollapsibleSection title={t('issuers.domains.title')}>
          <FormFieldset>
            <CreateForm.FormField
              label={<FormLabel>{t('issuers.domains.included')}</FormLabel>}
              input={
                <FormInput
                  compact
                  onChange={e =>
                    setIssuer({ ...issuer, includeDomains: e.target.value })
                  }
                  value={issuer.includeDomains}
                />
              }
            />
          </FormFieldset>
          <FormFieldset>
            <CreateForm.FormField
              label={<FormLabel>{t('issuers.domains.excluded')}</FormLabel>}
              input={
                <FormInput
                  compact
                  onChange={e =>
                    setIssuer({ ...issuer, excludeDomains: e.target.value })
                  }
                  value={issuer.excludeDomains}
                />
              }
            />
          </FormFieldset>
        </CreateForm.CollapsibleSection>
        <CreateForm.CollapsibleSection
          title={t('issuers.external-account-binding.title')}
        >
          <FormFieldset>
            <CreateForm.FormField
              label={
                <FormLabel>
                  {t('issuers.external-account-binding.key-id')}
                </FormLabel>
              }
              input={
                <FormInput
                  compact
                  onChange={e =>
                    setIssuer({
                      ...issuer,
                      externalAccountKeyId: e.target.value,
                    })
                  }
                  value={issuer.externalAccountKeyId}
                />
              }
            />
          </FormFieldset>
          <FormFieldset>
            <CreateForm.FormField
              label={
                <FormLabel>
                  {t('issuers.external-account-binding.secret-name')}
                </FormLabel>
              }
              input={
                <FormInput
                  compact
                  onChange={e =>
                    setIssuer({
                      ...issuer,
                      externalAccountSecretName: e.target.value,
                    })
                  }
                  value={issuer.externalAccountSecretName}
                />
              }
            />
          </FormFieldset>
          <FormFieldset>
            <CreateForm.FormField
              label={
                <FormLabel>
                  {t('issuers.external-account-binding.secret-namespace')}
                </FormLabel>
              }
              input={
                <FormInput
                  compact
                  onChange={e =>
                    setIssuer({
                      ...issuer,
                      externalAccountSecretNamespace: e.target.value,
                    })
                  }
                  value={issuer.externalAccountSecretNamespace}
                />
              }
            />
          </FormFieldset>
        </CreateForm.CollapsibleSection>
      </>
    );
  }
  return (
    <>
      <SimpleForm issuer={issuer} setIssuer={setIssuer} />
      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('issuers.requests-per-day')}</FormLabel>}
            input={
              <FormInput
                compact
                type="number"
                onChange={e =>
                  setIssuer({ ...issuer, requestsPerDayQuota: +e.target.value })
                }
                value={issuer.requestsPerDayQuota}
              />
            }
          />
        </FormFieldset>
        {issuer.type === 'acme' && (
          <FormFieldset>
            <CreateForm.FormField
              label={<FormLabel>{t('issuers.skip-dns')}</FormLabel>}
              input={
                <Checkbox
                  compact
                  type="number"
                  onChange={(e, checked) =>
                    setIssuer({
                      ...issuer,
                      skipDNSChallengeValidation: checked,
                    })
                  }
                  checked={issuer.skipDNSChallengeValidation}
                />
              }
            />
          </FormFieldset>
        )}
      </CreateForm.Section>
      {issuerTypeFields}
    </>
  );
}

function issuerToYaml(issuer) {
  let spec = {
    requestsPerDayQuota: issuer.requestsPerDayQuota || undefined,
  };
  if (issuer.type === 'ca') {
    spec = {
      ...spec,
      ca: {
        privateKeySecretRef: {
          name: issuer.privateKeyName,
          namespace: issuer.privateKeyNamespace,
        },
      },
    };
  } else if (issuer.type === 'acme') {
    const hasDomains = issuer.includeDomains || issuer.excludeDomains;
    const hasExternalAccount =
      issuer.externalAccountKeyId ||
      issuer.externalAccountSecretName ||
      issuer.externalAccountSecretNamespace;
    spec = {
      ...spec,
      acme: {
        server: issuer.server,
        email: issuer.email,
        autoRegistration: issuer.autoRegistration,
        privateKeySecretRef: issuer.autoRegistration
          ? undefined
          : {
              name: issuer.privateKeyName,
              namespace: issuer.privateKeyNamespace,
            },
        domains: hasDomains
          ? {
              include: issuer.includeDomains || undefined,
              exclude: issuer.excludeDomains || undefined,
            }
          : undefined,
        skipDNSChallengeValidation:
          issuer.skipDNSChallengeValidation || undefined,
        externalAccountBinding: hasExternalAccount
          ? {
              keyID: issuer.externalAccountKeyId,
              keySecretRef: {
                name: issuer.externalAccountSecretName,
                namespace: issuer.externalAccountSecretNamespace,
              },
            }
          : undefined,
      },
    };
  }

  return {
    apiVersion: 'cert.gardener.cloud/v1alpha1',
    kind: 'Issuer',
    metadata: {
      name: issuer.name,
      namespace: issuer.namespace,
    },
    spec,
  };
}
function yamlToIssuer(yaml, prevIssuer) {
  console.log('yamlToIssuer');
  let type = jp.value(yaml, '$.spec.ca')
    ? 'ca'
    : jp.value(yaml, '$.spec.acme')
    ? 'acme'
    : undefined;

  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    type,
    requestsPerDayQuota: jp.value(yaml, '$.spec.requestsPerDayQuota'),
    server: jp.value(yaml, '$.spec.acme.server') || '',
    email: jp.value(yaml, '$.spec.acme.email') || '',
    includeDomains: jp.value(yaml, '$.spec.acme.domains.include') || '',
    excludeDomains: jp.value(yaml, '$.spec.acme.domains.exclude') || '',
    skipDNSChallengeValidation:
      jp.value(yaml, '$.spec.acme.skipDNSChallengeValidation') || false,
    privateKeyName:
      (type === 'ca'
        ? jp.value(yaml, '$.spec.ca.privateKeySecretRef.name')
        : type === 'acme'
        ? jp.value(yaml, '$.spec.acme.privateKeySecretRef.name')
        : '') || '',
    privateKeyNamespace:
      (type === 'ca'
        ? jp.value(yaml, '$.spec.ca.privateKeySecretRef.namespace')
        : type === 'acme'
        ? jp.value(yaml, '$.spec.acme.privateKeySecretRef.namespace')
        : '') || '',
  };
}

function createIssuerTemplate(namespace) {
  return {
    name: '',
    namespace,
    type: undefined,
    server: '',
    email: '',
    autoRegistration: true,
    privateKeyName: '',
    privateKeyNamespace: '',
    requestsPerDayQuota: 0,
    skipDNSChallengeValidation: false,
    includeDomains: '',
    excludeDomains: '',
    externalAccountKeyId: '',
    externalAccountSecretName: '',
    externalAccountSecretNamespace: '',
  };
}

function createPresets(namespace, t) {
  return [
    {
      name: t('issuers.create.presets.default'),
      value: createIssuerTemplate(namespace),
    },
    {
      name: t('issuers.create.presets.ca'),
      value: {
        ...createIssuerTemplate(namespace),
        type: 'ca',
      },
    },
    {
      name: t('issuers.create.presets.acme'),
      value: {
        ...createIssuerTemplate(namespace),
        type: 'acme',
      },
    },
  ];
}

export function IssuersCreate({ onChange, formElementRef, namespace }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [issuer, setIssuer] = useState(createIssuerTemplate(namespace));
  console.log('issuer', issuer);

  const createIssuer = async () => {
    let createdIssuer = null;
    try {
      createdIssuer = await postRequest(
        `/apis/cert.gardener.cloud/v1alpha1/namespaces/${namespace}/issuers/`,
        issuerToYaml(issuer),
      );
      console.log('created issuer', createdIssuer);
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/issuers/details/${issuer.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('issuers.messages.failure'),
        content: e.message,
      });
      return false;
    }
    // const createdResourceUID = createdDeployment?.metadata?.uid;
  };

  return (
    <CreateForm
      title={t('issuers.create.title')}
      simpleForm={<SimpleForm issuer={issuer} setIssuer={setIssuer} />}
      advancedForm={<AdvancedForm issuer={issuer} setIssuer={setIssuer} />}
      resource={issuer}
      setResource={setIssuer}
      toYaml={issuerToYaml}
      fromYaml={yamlToIssuer}
      onCreate={createIssuer}
      onChange={onChange}
      presets={createPresets(namespace, t)}
      formElementRef={formElementRef}
    />
  );
}
