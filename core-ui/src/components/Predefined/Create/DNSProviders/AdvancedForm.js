import React from 'react';
import { FormInput, FormLabel, FormTextarea } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ dnsProvider, setDNSProvider }) {
  return (
    <>
      <SimpleForm dnsProvider={dnsProvider} setDNSProvider={setDNSProvider} />
      <CreateForm.Section>
        <CreateForm.FormField
          label={<FormLabel>Exclude Domains</FormLabel>}
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
              placeholder="Domains that should be ignored, one per line"
            />
          }
        />
        <CreateForm.FormField
          label={<FormLabel>Default TTL</FormLabel>}
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
              placeholder="Enter default time to live"
            />
          }
        />
      </CreateForm.Section>
    </>
  );
}
