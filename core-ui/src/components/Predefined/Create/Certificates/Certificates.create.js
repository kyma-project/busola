import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { usePost, useNotification } from 'react-shared';
import { Button, FormTextarea, Switch } from 'fundamental-react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { base64Decode, base64Encode } from 'shared/helpers';
import { IssuerRef } from 'shared/components/ResourceRef/IssuerRef';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';

import { createTemplate } from './templates';

import './CreateCertificate.scss';

export function CertificatesCreate({ onChange, formElementRef, namespace }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [certificate, setCertificate] = useState(createTemplate(namespace));
  const [withCSR, setWithCSR] = useState(false);
  const [existingSecret, setExistingSecret] = useState(false);
  const [csrIsEncoded, setCsrIsEncoded] = useState(false);

  return (
    <ResourceForm
      pluralKind="certificates"
      singularName={t('certificates.name_singular')}
      title={t('certificates.create.title')}
      resource={certificate}
      setResource={setCertificate}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/cert.gardener.cloud/v1alpha1/namespaces/${namespace}/certificates/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('certificates.name_singular')}
        customSetValue={name => {
          jp.value(certificate, '$.metadata.name', name);
          jp.value(
            certificate,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setCertificate({ ...certificate });
        }}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceForm.FormField
        label={t('certificates.with-csr')}
        tooltipContent={t('certificates.tooltips.with-csr')}
        input={() => (
          <div className="csr-header">
            <Switch
              compact
              onChange={e => setWithCSR(!withCSR)}
              checked={withCSR}
            />
            {withCSR && (
              <Button
                compact
                className="csr-encode-toggle"
                option="transparent"
                glyph={certificate.csrIsEncoded ? 'show' : 'hide'}
                onClick={() =>
                  setCertificate({
                    ...certificate,
                    csrIsEncoded: !certificate.csrIsEncoded,
                  })
                }
              >
                {certificate.csrIsEncoded
                  ? t('secrets.buttons.decode')
                  : t('secrets.buttons.encode')}
              </Button>
            )}
          </div>
        )}
      />
      {withCSR && (
        <>
          <ResourceForm.FormField
            required
            label={t('certificates.csr')}
            tooltipContent={t('certificates.tooltips.csr')}
            propertyPath="$.spec.csr"
            input={({ value, setValue }) => {
              console.log('CSR', value);
              return (
                <FormTextarea
                  compact
                  required
                  className="resize-vertical"
                  onChange={e =>
                    setValue(
                      csrIsEncoded
                        ? e.target.value
                        : base64Encode(e.target.value),
                    )
                  }
                  value={csrIsEncoded ? value : base64Decode(value || '')}
                  placeholder={
                    csrIsEncoded
                      ? t('certificates.placeholders.encoded-csr')
                      : t('certificates.placeholders.csr')
                  }
                />
              );
            }}
          />
        </>
      )}
      {!withCSR && (
        <>
          <ResourceForm.FormField
            required
            label={t('certificates.common-name')}
            tooltipContent={t('certificates.tooltips.common-name')}
            input={Inputs.Text}
            propertyPath="$.spec.commonName"
            inputProps={{
              maxlength: 64,
              placeholder: t('certificates.placeholders.common-name'),
            }}
          />
          <ResourceForm.TextArrayInput
            advanced
            propertyPath="$.spec.dnsNames"
            title={t('certificates.dns-names')}
            inputProps={{
              placeholder: t('certificates.placeholders.dns-names'),
            }}
          />
        </>
      )}
      <ResourceForm.FormField
        advanced
        label={t('certificates.issuer')}
        tooltipContent={t('certificates.tooltips.issuer')}
        propertyPath="$.spec.issuerRef"
        input={({ value, setValue }) => (
          <IssuerRef
            resourceRef={value || {}}
            onChange={(e, issuerRef) => setValue(issuerRef)}
          />
        )}
      />
      <ResourceForm.FormField
        advanced
        label={t('certificates.renew')}
        tooltipContent={t('certificates.tooltips.renew')}
        propertyPath="$.spec.renew"
        input={Inputs.Switch}
      />
      <ResourceForm.FormField
        advanced
        label={t('certificates.existing-secret')}
        tooltipContent={t('certificates.tooltips.existing-secret')}
        input={() => (
          <Switch
            compact
            onChange={e => setExistingSecret(!existingSecret)}
            checked={existingSecret}
          />
        )}
      />
      {!existingSecret && (
        <ResourceForm.FormField
          advanced
          label={t('certificates.secret-name')}
          tooltipContent={t('certificates.tooltips.secret-name')}
          propertyPath="$.spec.secretRef.name"
          input={Inputs.Text}
          inputProps={{
            placeholder: t('certificates.placeholders.secret-name'),
          }}
        />
      )}
      {existingSecret && (
        <ResourceForm.FormField
          advanced
          label={t('certificates.secret-ref')}
          tooltipContent={t('certificates.tooltips.secret-ref')}
          propertyPath="$.spec.secretRef"
          input={({ value, setValue }) => (
            <SecretRef
              fieldSelector="type=kubernetes.io/tls"
              resourceRef={value || {}}
              onChange={(e, secretRef) => setValue(value)}
            />
          )}
        />
      )}
    </ResourceForm>
  );
}
