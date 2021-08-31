import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  FormTextarea,
  Switch,
} from 'fundamental-react';

import { SimpleForm } from './SimpleForm';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

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
                />
              }
            />
          </FormFieldset>
        )}
        {certificate.existingSecret && (
          <>
            <FormFieldset>
              <CreateForm.FormField
                label={
                  <FormLabel>{t('certificates.secret-ref-name')}</FormLabel>
                }
                input={
                  <FormInput
                    compact
                    onChange={e =>
                      setCertificate({
                        ...certificate,
                        secretRefName: e.target.value,
                      })
                    }
                    value={certificate.secretRefName}
                  />
                }
              />
            </FormFieldset>
            <FormFieldset>
              <CreateForm.FormField
                label={
                  <FormLabel>
                    {t('certificates.secret-ref-namespace')}
                  </FormLabel>
                }
                input={
                  <FormInput
                    compact
                    onChange={e =>
                      setCertificate({
                        ...certificate,
                        secretRefNamespace: e.target.value,
                      })
                    }
                    value={certificate.secretRefNamespace}
                  />
                }
              />
            </FormFieldset>
          </>
        )}
      </CreateForm.Section>
    </>
  );
}
