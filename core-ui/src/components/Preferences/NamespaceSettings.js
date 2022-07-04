import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useFeatureToggle } from 'shared/hooks/useFeatureToggle';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Switch } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

export default function NamespaceSettings() {
  const { t } = useTranslation();
  const { groups } = useMicrofrontendContext();
  const [showHiddenNamespaces, setShowHiddenNamespaces] = useFeatureToggle(
    'showHiddenNamespaces',
  );

  const toggleVisibility = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.showHiddenNamespaces',
      showHiddenNamespaces: !showHiddenNamespaces,
    });
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
