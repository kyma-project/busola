import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-shared';

export function IssuerTypeDropdown({ type, setType }) {
  const { t } = useTranslation();
  const options = [
    { key: 'ca', text: t('issuers.ca') },
    { key: 'acme', text: t('issuers.acme') },
  ];
  console.log('!!type', type);
  return (
    <Dropdown
      compact
      options={options}
      selectedKey={type}
      onSelect={(_, selected) => setType(selected.key)}
      placeholder={t('issuers.placeholders.type')}
      fullWidth
      required
    />
  );
}
