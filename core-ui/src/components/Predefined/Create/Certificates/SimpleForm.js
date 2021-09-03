import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormFieldset,
  FormLabel,
  FormInput,
  FormTextarea,
  Switch,
} from 'fundamental-react';

import { K8sNameInput } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { IssuerRef } from 'shared/components/ResourceRef/IssuerRef';
import { base64Decode, base64Encode } from 'shared/helpers';

import './SimpleForm.scss';

export function SimpleForm({ certificate, setCertificate }) {
  const { t } = useTranslation();

  const setCSR = csr => {
    if (certificate.csrIsEncoded) {
      setCertificate({ ...certificate, csr });
    } else {
      const encodedCSR = base64Encode(csr);
      setCertificate({ ...certificate, csr: encodedCSR });
    }
  };

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
              maxlength="64"
              placeholder={t('certificates.placeholders.common-name')}
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
              placeholder={t('certificates.placeholders.dns-names')}
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
              onChange={e => setCSR(e.target.value)}
              value={
                certificate.csrIsEncoded
                  ? certificate.csr
                  : base64Decode(certificate.csr)
              }
              placeholder={
                certificate.csrIsEncoded
                  ? t('certificates.placeholders.encoded-csr')
                  : t('certificates.placeholders.csr')
              }
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
              <K8sNameInput
                compact
                required
                showLabel={false}
                onChange={e =>
                  setCertificate({ ...certificate, name: e.target.value })
                }
                value={certificate.name}
                placeholder={t('certificates.placeholders.name')}
              />
            }
          />
        </FormFieldset>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('certificates.with-csr')}</FormLabel>}
            input={
              <div class="csr-header">
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
                {certificate.withCSR && (
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
