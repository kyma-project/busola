import React from 'react';
import { FormItem, FormLabel } from 'fundamental-react';
import { Dropdown } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function HostDropdown({ gateway, host, setHost }) {
  const { t } = useTranslation();
  const filterUnique = (e, i, arr) => arr.indexOf(e) === i;

  const options = (gateway?.spec.servers.flatMap(s => s.hosts) || [])
    .filter(filterUnique)
    .map(host => ({ text: host, key: host }));

  return (
    <FormItem>
      <FormLabel>{t('api-rules.list.headers.host')}</FormLabel>
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
