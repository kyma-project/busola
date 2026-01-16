import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

type AuthenticationTypeDropdownProps = {
  type: string;
  setType: (type: string) => void;
  accessibleName?: string;
};

export function AuthenticationTypeDropdown({
  type,
  setType,
  accessibleName,
}: AuthenticationTypeDropdownProps) {
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
