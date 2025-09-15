import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

export function AuthenticationTypeDropdown({ type, setType, accessibleName }) {
  const { t } = useTranslation();
  const options = [
    { key: 'token', text: t('clusters.token') },
    { key: 'oidc', text: t('clusters.oidc') },
  ];
  return (
    <Dropdown
      accessibleName={accessibleName}
      options={options}
      selectedKey={type}
      onSelect={(_, selected) => setType(selected.key)}
      required
    />
  );
}
