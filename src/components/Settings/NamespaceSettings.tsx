import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Label, Switch } from '@ui5/webcomponents-react';
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
    <div className="settings-row">
      <Label
        for="show-hidden-namespaces-switch"
        className="bsl-has-color-status-4"
      >
        {t('settings.general.showHiddenNamespaces')}
      </Label>
      <div>
        <Switch
          id="show-hidden-namespaces-switch"
          accessibleName={t('settings.general.showHiddenNamespaces')}
          checked={showHiddenNamespaces}
          onChange={toggleVisibility}
        />
      </div>
    </div>
  );
}
