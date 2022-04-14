import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

export function ProviderTypeDropdown({ type, setType }) {
  const { t } = useTranslation();
  const providers = {
    'alicloud-dns': 'Alicloud DNS provider',
    'aws-route53': 'AWS Route 53 provider',
    'azure-dns': 'Azure DNS provider',
    'google-clouddns': 'Google CloudDNS provider',
    'openstack-designate': 'Openstack Designate provider',
    'cloudflare-dns': 'Cloudflare DNS provider',
    'infoblox-dns': 'Infoblox DNS provider',
    'netlify-dns': 'Netlify DNS provider',
  };

  const options = Object.entries(providers).map(([name, displayName]) => ({
    key: name,
    text: displayName,
  }));

  return (
    <Dropdown
      compact
      options={options}
      selectedKey={type}
      onSelect={(_, selected) => setType(selected.key)}
      placeholder={t('dnsproviders.placeholders.provider-type')}
      fullWidth
      required
    />
  );
}
