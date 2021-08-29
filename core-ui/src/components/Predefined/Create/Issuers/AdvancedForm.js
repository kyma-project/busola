import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  Checkbox,
} from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import { PrivateKeyForm } from './PrivateKeyForm';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ issuer, setIssuer }) {
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
