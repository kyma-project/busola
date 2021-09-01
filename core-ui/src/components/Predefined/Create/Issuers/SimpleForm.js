import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput, Select } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import { PrivateKeyForm } from './PrivateKeyForm';

export function SimpleForm({ issuer, setIssuer }) {
  const { t } = useTranslation();

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
                placeholder={t('issuers.placeholders.server')}
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
                placeholder={t('issuers.placeholders.email')}
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
                placeholder={t('issuers.placeholders.name')}
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
                placeholder={t('issuers.placeholders.type')}
              ></Select>
            }
          />
        </FormFieldset>
      </CreateForm.Section>
      {issuerTypeFields}
    </>
  );
}
