import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Label, Switch } from '@ui5/webcomponents-react';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';

export default function NamespaceSettings() {
  const { t } = useTranslation();
  const [showHiddenNamespaces, setShowHiddenNamespaces] = useAtom(
    showHiddenNamespacesState,
  );

  const toggleVisibility = () => {
    setShowHiddenNamespaces(!showHiddenNamespaces);
  };

  return (
    <div className="preferences-row">
      <Label
        for="show-hidden-namespaces-switch"
        className="bsl-has-color-status-4"
      >
        {t('settings.clusters.showHiddenNamespaces')}
      </Label>
      <div>
        <Switch
          id="show-hidden-namespaces-switch"
          accessibleName={t('settings.clusters.showHiddenNamespaces')}
          checked={showHiddenNamespaces}
          onChange={toggleVisibility}
        />
      </div>
    </div>
  );
}
