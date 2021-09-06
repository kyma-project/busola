import React from 'react';
import { FormInput, FormLabel, FormTextarea } from 'fundamental-react';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ dnsEntry, setDNSEntry }) {
  return (
    <>
      <SimpleForm dnsEntry={dnsEntry} setDNSEntry={setDNSEntry} />
      <CreateForm.FormField
        label={<FormLabel>TTL</FormLabel>}
        input={
          <FormInput
            compact
            type="number"
            value={dnsEntry.ttl}
            onChange={e =>
              setDNSEntry({ ...dnsEntry, ttl: e.target.valueAsNumber })
            }
            placeholder="Enter time to live"
          />
        }
      />
      <CreateForm.FormField
        label={<FormLabel>DNS Name</FormLabel>}
        input={
          <FormInput
            compact
            value={dnsEntry.dnsName}
            onChange={e =>
              setDNSEntry({ ...dnsEntry, dnsName: e.target.value })
            }
            placeholder="Enter DNS Name"
          />
        }
      />
      <CreateForm.FormField
        label={<FormLabel required>Text</FormLabel>}
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
            placeholder="Text records, one per line"
          />
        }
      />
    </>
  );
}
