import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormFieldset,
  FormLabel,
  FormInput,
  FormTextarea,
  Checkbox,
} from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';

import { PrivateKeyForm } from './PrivateKeyForm';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ issuer, setIssuer }) {
  const { t } = useTranslation();

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
                <FormTextarea
                  compact
                  className="resize-vertical"
                  onChange={e =>
                    setIssuer({
                      ...issuer,
                      includeDomains: e.target.value.split('\n'),
                    })
                  }
                  value={issuer.includeDomains.join('\n')}
                  placeholder={t('issuers.placeholders.included-domains')}
                />
              }
            />
          </FormFieldset>
          <FormFieldset>
            <CreateForm.FormField
              label={<FormLabel>{t('issuers.domains.excluded')}</FormLabel>}
              input={
                <FormTextarea
                  compact
                  className="resize-vertical"
                  onChange={e =>
                    setIssuer({
                      ...issuer,
                      excludeDomains: e.target.value.split('\n'),
                    })
                  }
                  value={issuer.excludeDomains.join('\n')}
                  placeholder={t('issuers.placeholders.excluded-domains')}
                />
              }
            />
          </FormFieldset>
        </CreateForm.CollapsibleSection>
        <CreateForm.CollapsibleSection
          title={t('issuers.external-account.title')}
        >
          <FormFieldset>
            <CreateForm.FormField
              label={
                <FormLabel>{t('issuers.external-account.key-id')}</FormLabel>
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
                  placeholder={t('issuers.placeholders.key-id')}
                />
              }
            />
          </FormFieldset>
          <FormFieldset>
            <CreateForm.FormField
              label={
                <FormLabel>{t('issuers.external-account.secret')}</FormLabel>
              }
              input={
                <SecretRef
                  fieldSelector="type=kubernetes.io/tls"
                  resourceRef={issuer.externalAccountSecretRef}
                  onChange={(e, externalAccountSecretRef) =>
                    setIssuer({ ...issuer, externalAccountSecretRef })
                  }
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
                placeholder={t('issuers.placeholders.requests-per-day')}
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
