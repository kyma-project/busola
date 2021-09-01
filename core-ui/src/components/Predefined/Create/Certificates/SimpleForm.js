import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  FormTextarea,
  Switch,
  ComboboxInput,
} from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { IssuerRef } from 'shared/components/ResourceRef/IssuerRef';

export function SimpleForm({ certificate, setCertificate }) {
  const { t } = useTranslation();

  const commonNameFields = (
    <>
      <FormFieldset>
        <CreateForm.FormField
          label={
            <FormLabel required>{t('certificates.common-name')}</FormLabel>
          }
          input={
            <FormInput
              compact
              required
              onChange={e =>
                setCertificate({ ...certificate, commonName: e.target.value })
              }
              value={certificate.commonName}
            />
          }
        />
      </FormFieldset>
      <FormFieldset>
        <CreateForm.FormField
          label={<FormLabel>{t('certificates.dns-names')}</FormLabel>}
          input={
            <FormTextarea
              compact
              className="resize-vertical"
              onChange={e =>
                setCertificate({
                  ...certificate,
                  dnsNames: e.target.value.split('\n'),
                })
              }
              value={certificate.dnsNames.join('\n')}
            />
          }
        />
      </FormFieldset>
    </>
  );

  const csrFields = (
    <>
      <FormFieldset>
        <CreateForm.FormField
          label={<FormLabel required>{t('certificates.csr')}</FormLabel>}
          input={
            <FormTextarea
              compact
              required
              className="resize-vertical"
              onChange={e =>
                setCertificate({ ...certificate, csr: e.target.value })
              }
              value={certificate.csr}
            />
          }
        />
      </FormFieldset>
    </>
  );

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
                onChange={e =>
                  setCertificate({ ...certificate, name: e.target.value })
                }
                value={certificate.name}
              />
            }
          />
        </FormFieldset>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('certificates.with-csr')}</FormLabel>}
            input={
              <Switch
                compact
                onChange={e =>
                  setCertificate({
                    ...certificate,
                    withCSR: !certificate.withCSR,
                  })
                }
                checked={certificate.withCSR}
              />
            }
          />
        </FormFieldset>
        {(certificate.withCSR && csrFields) || commonNameFields}
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('certificates.issuer')}</FormLabel>}
            input={
              <IssuerRef
                resourceRef={certificate.issuerRef}
                onChange={(e, issuerRef) =>
                  setCertificate({ ...certificate, issuerRef })
                }
              />
            }
          />
        </FormFieldset>
      </CreateForm.Section>
    </>
  );
}
