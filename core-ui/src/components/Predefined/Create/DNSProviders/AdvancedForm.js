import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, FormLabel, FormTextarea } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ dnsProvider, setDNSProvider }) {
  const { t } = useTranslation();
  return (
    <>
      <SimpleForm dnsProvider={dnsProvider} setDNSProvider={setDNSProvider} />
      <CreateForm.Section>
        <CreateForm.FormField
          label={
            <FormLabel>{t('dnsproviders.labels.exclude-domains')}</FormLabel>
          }
          required
          className="advanced-form-top"
          input={
            <FormTextarea
              compact
              className="resize-vertical"
              onChange={e =>
                setDNSProvider({
                  ...dnsProvider,
                  domains: {
                    ...dnsProvider.domains,
                    exclude: e.target.value.split('\n').filter(d => d),
                  },
                })
              }
              value={dnsProvider.domains?.exclude?.join('\n') || ''}
              placeholder={t('dnsproviders.placeholders.exclude-domains')}
            />
          }
        />
        <CreateForm.FormField
          label={<FormLabel>{t('dnsproviders.labels.default-ttl')}</FormLabel>}
          input={
            <FormInput
              compact
              type="number"
              value={dnsProvider.defaultTTL}
              onChange={e =>
                setDNSProvider({
                  ...dnsProvider,
                  defaultTTL: e.target.valueAsNumber,
                })
              }
              placeholder={t('dnsproviders.placeholders.default-ttl')}
            />
          }
        />
      </CreateForm.Section>
    </>
  );
}
