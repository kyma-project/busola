import React from 'react';
import { FormItem, FormLabel } from 'fundamental-react';
import { Dropdown } from 'react-shared';

export const hasWildcard = host => {
  if (!host) return false;

  // host may contain optional namespace prefix ({namespace}/{host})
  if (host.includes('/')) {
    var [_namespace, host] = host.split('/');
  }
  return host.includes('*');
};

export function HostDropdown({ gateway, host, setHost }) {
  const filterUnique = (e, i, arr) => arr.indexOf(e) === i;

  const options = (gateway?.spec.servers.flatMap(s => s.hosts) || [])
    .filter(filterUnique)
    .map(host => ({ text: host, key: host }));

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
