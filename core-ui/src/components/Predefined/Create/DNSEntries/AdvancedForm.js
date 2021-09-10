import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, FormLabel, FormTextarea } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ dnsEntry, setDNSEntry }) {
  const { t } = useTranslation();
  return (
    <>
      <SimpleForm dnsEntry={dnsEntry} setDNSEntry={setDNSEntry} />
      <CreateForm.FormField
        label={<FormLabel>{t('dnsentries.labels.ttl')}</FormLabel>}
        input={
          <FormInput
            compact
            type="number"
            value={dnsEntry.ttl}
            onChange={e =>
              setDNSEntry({ ...dnsEntry, ttl: e.target.valueAsNumber })
            }
            placeholder={t('dnsentries.placeholders.ttl')}
          />
        }
      />
      <CreateForm.FormField
        label={<FormLabel>{t('dnsentries.labels.dns-name')}</FormLabel>}
        input={
          <FormInput
            compact
            value={dnsEntry.dnsName}
            onChange={e =>
              setDNSEntry({ ...dnsEntry, dnsName: e.target.value })
            }
            placeholder={t('dnsentries.placeholders.dns-name')}
          />
        }
      />
      <CreateForm.FormField
        label={<FormLabel required>{t('dnsentries.labels.text')}</FormLabel>}
        required
        input={
          <FormTextarea
            compact
            className="resize-vertical"
            onChange={e =>
              setDNSEntry({
                ...dnsEntry,
                text: e.target.value.split('\n'),
              })
            }
            value={dnsEntry.text.join('\n')}
            placeholder={t('dnsentries.placeholders.text')}
          />
        }
      />
    </>
  );
}
