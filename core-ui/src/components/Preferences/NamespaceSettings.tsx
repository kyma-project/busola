import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Switch } from 'fundamental-react';
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
          // TypeScript definitions are out of sync here
          // @ts-ignore
          localizedText={{
            switchLabel: t('settings.clusters.showHiddenNamespaces'),
          }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={showHiddenNamespaces}
          onChange={toggleVisibility}
          compact
        />
      </div>
    </div>
  );
}
