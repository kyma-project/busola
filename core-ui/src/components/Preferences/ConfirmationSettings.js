import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useFeatureToggle } from 'shared/hooks/useFeatureToggle';

export default function ConfirmationSettings() {
  const { t } = useTranslation();
  const [dontConfirmDelete, setDontConfirmDelete] = useFeatureToggle(
    'dontConfirmDelete',
  );

  const toggleValue = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.dontConfirmDelete',
      value: !dontConfirmDelete,
    });
    setDontConfirmDelete(!dontConfirmDelete);
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.clusters.dontConfirmDelete')}
      </span>
      <div>
        <Switch
          inputProps={{
            'aria-label': t('settings.clusters.dontConfirmDelete'),
          }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={dontConfirmDelete}
          onChange={toggleValue}
          compact
        />
      </div>
    </div>
  );
}
