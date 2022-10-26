import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Switch } from 'fundamental-react';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { groupsState } from 'state/groupsAtom';

export default function NamespaceSettings() {
  const { t } = useTranslation();
  const groups = useRecoilValue(groupsState);
  const [showHiddenNamespaces, setShowHiddenNamespaces] = useRecoilState(
    showHiddenNamespacesState,
  );

  const toggleVisibility = () => {
    setShowHiddenNamespaces(!showHiddenNamespaces);
  };

  const shouldShowNamespaceSettings = () => {
    if (!Array.isArray(groups)) {
      return true;
    }
    return groups.includes('runtimeAdmin');
  };

  return (
    shouldShowNamespaceSettings() && (
      <div className="preferences-row">
        <span className="fd-has-color-status-4">
          {t('settings.clusters.showHiddenNamespaces')}
        </span>
        <div>
          <Switch
            inputProps={{
              'aria-label': t('settings.clusters.showHiddenNamespaces'),
            }}
            className="fd-has-display-inline-block fd-margin-begin--tiny"
            checked={showHiddenNamespaces}
            onChange={toggleVisibility}
            compact
          />
        </div>
      </div>
    )
  );
}
