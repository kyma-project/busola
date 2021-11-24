import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useFeatureToggle } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';

export default function ProtectedSettings() {
  const { t } = useTranslation();

  const [
    disableResourceProtection,
    setDisableResourceProtection,
  ] = useFeatureToggle('disableResourceProtection');

  const toggleDisableResourceProtection = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.disableResourceProtection',
      disableResourceProtection: !disableResourceProtection,
    });
    setDisableResourceProtection(!disableResourceProtection);
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.clusters.disableResourceProtection')}
      </span>
      <div>
        <Switch
          inputProps={{
            'aria-label': t('settings.clusters.disableResourceProtection'),
          }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={disableResourceProtection}
          onChange={toggleDisableResourceProtection}
          compact
        />
      </div>
    </div>
  );
}
