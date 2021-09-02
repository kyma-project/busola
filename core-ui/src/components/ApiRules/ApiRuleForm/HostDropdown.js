import React from 'react';
import { FormItem, FormLabel } from 'fundamental-react';
import { Dropdown } from 'react-shared';

export function HostDropdown({ gateway, host, setHost }) {
  const options = (
    gateway?.spec.servers.flatMap(s =>
      s.hosts.filter(h => h.startsWith('*.')),
    ) || []
  ).map(host => ({
    text: host.replace('*', ''),
    key: host.replace('*', ''),
  }));

  return (
    <FormItem>
      <FormLabel>Host</FormLabel>
      <Dropdown
        id="host-dropdown"
        options={options}
        selectedKey={host}
        disabled={!gateway}
        onSelect={(_, selected) => setHost(selected.key)}
      />
    </FormItem>
  );
}
