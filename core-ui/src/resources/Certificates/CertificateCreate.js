import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormTextarea, Switch } from 'fundamental-react';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { TextArrayInput } from 'shared/ResourceForm/fields';
import { base64Decode, base64Encode } from 'shared/helpers';
import { IssuerRef } from 'shared/components/ResourceRef/IssuerRef';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';

import { createTemplate } from './templates';

import './CertificateCreate.scss';

export function CertificateCreate({
  setCustomValid,
  onChange,
  formElementRef,
  namespace,
  resource: initialCertificate,
  resourceUrl,
  handleSetResetFormFn,
  ...props
}) {
  const { t } = useTranslation();

  const [certificate, setCertificate] = useState(
    initialCertificate
      ? cloneDeep(initialCertificate)
      : createTemplate(namespace),
  );
  const [withCSR, setWithCSR] = useState(!!jp.value(certificate, '$.spec.csr'));
  const [existingSecret, setExistingSecret] = useState(
    !!jp.value(certificate, '$.spec.secretRef'),
  );
  const [csrIsEncoded, setCsrIsEncoded] = useState(false);
  const [decodeError, setDecodeError] = useState(null);

  const csrValue = value => {
    if (csrIsEncoded) {
      return value;
    } else {
      try {
        setDecodeError(null);
        return base64Decode(value || '');
      } catch (e) {
        setDecodeError(e.message);
        setCsrIsEncoded(true);
        return '';
      }
    }
  };

  useEffect(() => {
    handleSetResetFormFn(() => () => {
      setWithCSR(!!jp.value(certificate, '$.spec.csr'));
      setCertificate(
        initialCertificate
          ? cloneDeep(initialCertificate)
          : createTemplate(namespace),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (withCSR) {
      jp.value(certificate, '$.spec.commonName', undefined);
      jp.value(certificate, '$.spec.dnsNames', undefined);
    } else {
      jp.value(certificate, '$.spec.csr', undefined);
    }
    setCertificate({ ...certificate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withCSR]);

  useEffect(() => {
    if (existingSecret) {
      jp.value(certificate, '$.spec.secretName', undefined);
    } else {
      jp.value(certificate, '$.spec.secretRef', undefined);
    }
    setCertificate({ ...certificate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingSecret]);

  useEffect(() => {
    if (jp.value(certificate, '$.spec.csr')) {
      setWithCSR(true);
    } else {
      setDecodeError(null);
      if (jp.value(certificate, '$.spec.commonName')) {
        setWithCSR(false);
      }
    }

    if (jp.value(certificate, '$.spec.secretRef')) {
      setExistingSecret(true);
    } else if (jp.value(certificate, '$.spec.secretName')) {
      setExistingSecret(false);
    }
    if (existingSecret) {
      setCustomValid(
        jp.value(certificate, '$.spec.secretRef.name') &&
          jp.value(certificate, '$.spec.secretRef.namespace'),
      );
    }

    if (!existingSecret) {
      setCustomValid(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate]);

  return (
    <ResourceForm
      {...props}
      pluralKind="certificates"
      singularName={t('certificates.name_singular')}
      resource={certificate}
      setResource={setCertificate}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialCertificate}
      createUrl={resourceUrl}
      nameProps={{ 'data-cy': 'cert-name' }}
      handleSetResetFormFn={handleSetResetFormFn}
    >
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
                glyph={csrIsEncoded ? 'show' : 'hide'}
                onClick={() => setCsrIsEncoded(!csrIsEncoded)}
                iconBeforeText
              >
                {csrIsEncoded
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
            input={({ value, setValue }) => (
              <>
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
                  value={csrValue(value)}
                  placeholder={
                    csrIsEncoded
                      ? t('certificates.placeholders.encoded-csr')
                      : t('certificates.placeholders.csr')
                  }
                  validationState={
                    decodeError && {
                      state: 'error',
                      text: t('certificates.messages.decode-error', {
                        message: decodeError,
                      }),
                    }
                  }
                />
              </>
            )}
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
            maxLength={64}
            placeholder={t('certificates.placeholders.common-name')}
          />
          <TextArrayInput
            advanced
            propertyPath="$.spec.dnsNames"
            title={t('certificates.dns-names')}
            placeholder={t('certificates.placeholders.dns-names')}
          />
        </>
      )}
      <IssuerRef
        advanced
        title={t('certificates.issuer')}
        tooltipContent={t('certificates.tooltips.issuer')}
        propertyPath="$.spec.issuerRef"
        currentNamespace={namespace}
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
        input={Inputs.Switch}
        onChange={() => setExistingSecret(!existingSecret)}
        checked={existingSecret}
      />
      {!existingSecret && (
        <ResourceForm.FormField
          advanced
          label={t('certificates.secret-name')}
          tooltipContent={t('certificates.tooltips.secret-name')}
          propertyPath="$.spec.secretName"
          input={Inputs.Text}
        />
      )}
      {existingSecret && (
        <SecretRef
          advanced
          title={t('certificates.secret-ref')}
          tooltipContent={t('certificates.tooltips.secret-ref')}
          fieldSelector="type=kubernetes.io/tls"
          propertyPath="$.spec.secretRef"
          currentNamespace={namespace}
          required
        />
      )}
    </ResourceForm>
  );
}
CertificateCreate.allowEdit = true;
