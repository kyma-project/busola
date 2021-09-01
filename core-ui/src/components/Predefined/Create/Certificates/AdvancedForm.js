import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput, Switch } from 'fundamental-react';

import { SecretRef } from 'shared/components/ResourceRef/SecretRef';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ certificate, setCertificate }) {
  const { t } = useTranslation();

  return (
    <>
      <SimpleForm certificate={certificate} setCertificate={setCertificate} />
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
          <FormFieldset>
            <CreateForm.FormField
              label={<FormLabel>{t('certificates.secret-ref')}</FormLabel>}
              input={
                <SecretRef
                  labelSelector="cert.gardener.cloud/certificate=true"
                  resourceRef={certificate.secretRef}
                  onChange={(e, secretRef) =>
                    setCertificate({ ...certificate, secretRef })
                  }
                />
              }
            />
          </FormFieldset>
        )}
      </CreateForm.Section>
    </>
  );
}
