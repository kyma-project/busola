import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

export function IssuerTypeDropdown({ type, setType }) {
  const { t, i18n } = useTranslation();
  const options = [
    { key: 'ca', text: t('issuers.ca') },
    { key: 'acme', text: t('issuers.acme') },
  ];
  return (
    <Dropdown
      compact
      options={options}
      selectedKey={type}
      onSelect={(_, selected) => setType(selected.key)}
      placeholder={t('issuers.placeholders.type')}
      i18n={i18n}
      fullWidth
      required
    />
  );
}
