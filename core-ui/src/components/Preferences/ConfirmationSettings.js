import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, Switch } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useFeatureToggle } from 'react-shared';

export default function ConfirmationSettings() {
  const { t, i18n } = useTranslation();
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
    <LayoutPanel className="fd-margin--tiny fd-margin-top--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('settings.confirmations')} />
        <LayoutPanel.Actions>
          {t('settings.dontConfirmDelete')}
          <Switch
            inputProps={{ 'aria-label': 'toggle-hidden-namespaces' }}
            className="fd-has-display-inline-block fd-margin-begin--tiny"
            checked={dontConfirmDelete}
            onChange={toggleValue}
          />
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
    </LayoutPanel>
  );
}
