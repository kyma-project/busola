import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Switch } from '@ui5/webcomponents-react';
import { FormField } from 'shared/ResourceForm/components/FormField';
import { showHiddenNamespacesAtom } from 'state/settings/showHiddenNamespacesAtom';

export default function NamespaceSettings() {
  const { t } = useTranslation();
  const [showHiddenNamespaces, setShowHiddenNamespaces] = useAtom(
    showHiddenNamespacesAtom,
  );

  const toggleVisibility = () => {
    setShowHiddenNamespaces(!showHiddenNamespaces);
  };

  return (
    <FormField
      label={t('settings.general.showHiddenNamespaces')}
      input={(props) => (
        <Switch
          {...props}
          checked={showHiddenNamespaces}
          onChange={toggleVisibility}
        />
      )}
    />
  );
}
