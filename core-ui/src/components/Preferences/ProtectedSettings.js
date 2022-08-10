import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';

import { useFeatureToggle } from 'shared/hooks/useFeatureToggle';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export default function ProtectedSettings() {
  const { t } = useTranslation();
  const [
    disableResourceProtection,
    setDisableResourceProtection,
  ] = useFeatureToggle('disableResourceProtection');
  const microfrontendContext = useMicrofrontendContext();
  const protectedResourcesEnabled =
    microfrontendContext?.features?.PROTECTED_RESOURCES?.isEnabled;

  if (!protectedResourcesEnabled) return null;

  const toggleDisableResourceProtection = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.disableResourceProtection',
      disableResourceProtection: !disableResourceProtection,
    });
    setDisableResourceProtection(!disableResourceProtection);
  };

  return (
    <>
      <div className="preferences-row">
        <span className="fd-has-color-status-4">
          {t('settings.clusters.disableResourceProtection')}
        </span>
        <div>
          <Switch
            compact
            inputProps={{
              'aria-label': t('settings.clusters.disableResourceProtection'),
            }}
            className="fd-has-display-inline-block fd-margin-begin--tiny"
            checked={disableResourceProtection}
            onChange={toggleDisableResourceProtection}
          />
        </div>
      </div>
    </>
  );
}
