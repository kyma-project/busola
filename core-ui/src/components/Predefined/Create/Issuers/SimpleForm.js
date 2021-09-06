import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput, Select } from 'fundamental-react';

import { K8sNameInput } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import { PrivateKeyForm } from './PrivateKeyForm';

export function SimpleForm({ issuer, setIssuer }) {
  const { t } = useTranslation();

  const caFields = (
    <CreateForm.Section>
      <PrivateKeyForm issuer={issuer} setIssuer={setIssuer} />
    </CreateForm.Section>
  );

  const acmeFields = (
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
              <>
                <Select
                  compact
                  onSelect={(e, { key }) => setIssuer({ ...issuer, type: key })}
                  options={[
                    { key: 'ca', text: t('issuers.ca') },
                    { key: 'acme', text: t('issuers.acme') },
                  ]}
                  selectedKey={issuer.type}
                  placeholder={t('issuers.placeholders.type')}
                />
                {/* a hack to counteract the lack of `required` parameter support on Select */}
                <FormInput
                  required
                  value={issuer.type}
                  style={{ display: 'none' }}
                />
              </>
            }
          />
        </FormFieldset>
      </CreateForm.Section>
      {issuer.type === 'ca' && caFields}
      {issuer.type === 'acme' && acmeFields}
    </>
  );
}
