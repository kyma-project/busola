import React from 'react';
import { FormInput, FormLabel, FormTextarea } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ dnsProvider, setDNSProvider }) {
  return (
    <>
      <SimpleForm dnsProvider={dnsProvider} setDNSProvider={setDNSProvider} />

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
    </>
  );
}
