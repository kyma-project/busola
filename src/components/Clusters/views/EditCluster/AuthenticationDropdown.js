import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

export function AuthenticationTypeDropdown({ type, setType }) {
  const { t } = useTranslation();
  const options = [
    { key: 'token', text: t('clusters.token') },
    { key: 'oidc', text: t('clusters.oidc') },
  ];
  return (
    <Dropdown
      compact
      options={options}
      selectedKey={type}
      onSelect={(_, selected) => setType(selected.key)}
      fullWidth
      required
    />
  );
}
