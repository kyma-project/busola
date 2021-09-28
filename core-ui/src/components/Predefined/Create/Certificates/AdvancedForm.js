import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput, Switch } from 'fundamental-react';

import { SecretRef } from 'shared/components/ResourceRef/SecretRef';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import { SimpleForm } from './SimpleForm';
import * as jp from 'jsonpath';

export function AdvancedForm({ certificate, setCertificate }) {
  const { t } = useTranslation();

  return (
    <>
      <SimpleForm
        certificate={certificate}
        setCertificate={setCertificate}
        isAdvanced={true}
      />
      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('certificates.renew')}</FormLabel>}
            input={
              <Switch
                compact
                onChange={e =>
                  setCertificate({
                    ...certificate,
                    renew: !certificate.renew,
                  })
                }
                checked={certificate.renew}
              />
            }
          />
        </FormFieldset>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('certificates.existing-secret')}</FormLabel>}
            input={
              <Switch
                compact
                onChange={e =>
                  setCertificate({
                    ...certificate,
                    existingSecret: !certificate.existingSecret,
                  })
                }
                checked={certificate.existingSecret}
              />
            }
          />
        </FormFieldset>
        {!certificate.existingSecret && (
          <FormFieldset>
            <CreateForm.FormField
              label={<FormLabel>{t('certificates.secret-name')}</FormLabel>}
              input={
                <FormInput
                  compact
                  onChange={e =>
                    setCertificate({
                      ...certificate,
                      secretName: e.target.value,
                    })
                  }
                  value={certificate.secretName}
                  placeholder={t('certificates.placeholders.secret-name')}
                />
              }
            />
          </FormFieldset>
        )}
        {certificate.existingSecret && (
          <SecretRef
            className={'fd-margin-top--sm'}
            id="secretRef"
            fieldSelector="type=kubernetes.io/tls"
            resourceRef={jp.value(certificate, '$.secretRef') || {}}
            title={t('certificates.secret-ref')}
            onChange={secretRef => {
              jp.value(certificate, '$.secretRef', secretRef);
              setCertificate({ ...certificate, secretRef });
            }}
          />
        )}
      </CreateForm.Section>
    </>
  );
}
