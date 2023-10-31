import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Switch } from '@ui5/webcomponents-react';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';

export default function NamespaceSettings() {
  const { t } = useTranslation();
  const [showHiddenNamespaces, setShowHiddenNamespaces] = useRecoilState(
    showHiddenNamespacesState,
  );

  const toggleVisibility = () => {
    setShowHiddenNamespaces(!showHiddenNamespaces);
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.clusters.showHiddenNamespaces')}
      </span>
      <div>
        <Switch
          aria-label={t('settings.clusters.showHiddenNamespaces')}
          className="bsl-margin-begin--tiny"
          checked={showHiddenNamespaces}
          onChange={toggleVisibility}
        />
      </div>
    </div>
  );
}
