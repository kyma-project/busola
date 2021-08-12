import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useFeatureToggle } from 'react-shared';

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
        {t('settings.dontConfirmDelete')}
      </span>
      <div>
        <Switch
          inputProps={{ 'aria-label': 'toggle-hidden-namespaces' }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={dontConfirmDelete}
          onChange={toggleValue}
        />
      </div>
    </div>
  );
}
