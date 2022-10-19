import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Icon } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

import { Tab } from 'shared/components/Tabs/Tab';
import { Tabs } from 'shared/components/Tabs/Tabs';
import { VerticalTabs } from 'shared/components/VerticalTabs/VerticalTabs';
import { useCustomMessageListener } from 'hooks/useCustomMessageListener';

import NamespaceSettings from './NamespaceSettings';
import ProtectedSettings from './ProtectedSettings';
import ThemeChooser from './ThemeChooser';
import LanguageSettings from './LanguageSettings';
import OtherSettings from './OtherSettings';
import ConfirmationSettings from './ConfirmationSettings';
import './Preferences.scss';

function Preferences() {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);

  const tabs = [
    {
      title: t('settings.interface.title'),
      description: t('settings.interface.description'),
      icon: (
        <Icon
          glyph="accelerated"
          size="xl"
          ariaLabel={t('settings.interface.title')}
        />
      ),
      id: 1,
    },
    {
      title: t('settings.clusters.title'),
      description: t('settings.clusters.description'),
      icon: (
        <Icon
          glyph="database"
          size="xl"
          ariaLabel={t('settings.clusters.title')}
        />
      ),
      id: 2,
    },
  ];

  const handleCloseModal = () => {
    setModalOpen(false);
    LuigiClient.uxManager().removeBackdrop();
  };

  const actions = [
    <Button onClick={handleCloseModal}>{t('common.buttons.close')}</Button>,
  ];

  useCustomMessageListener('open-preferences', () => {
    setModalOpen(true);
    LuigiClient.uxManager().addBackdrop();
  });

  return (
    <Dialog
      show={isModalOpen}
      title={t('preferences.title')}
      actions={actions}
      className="preferences-dialog"
    >
      <VerticalTabs tabs={tabs} height="100vh">
        <VerticalTabs.Content id={1}>
          <Tabs className="fd-tabs fd-has-padding-left-regular">
            <Tab
              key="theme-settings"
              id="theme-settings"
              title={t('settings.theme')}
            >
              <ThemeChooser />
            </Tab>
            <Tab
              key="language-settings"
              id="language-settings"
              title={t('settings.language')}
            >
              <LanguageSettings />
            </Tab>
            <Tab
              key="other-settings"
              id="other-settings"
              title={t('settings.other.title')}
            >
              <OtherSettings />
            </Tab>
          </Tabs>
        </VerticalTabs.Content>
        <VerticalTabs.Content id={2}>
          <div>
            <NamespaceSettings />
            <ConfirmationSettings />
            <ProtectedSettings />
          </div>
        </VerticalTabs.Content>
      </VerticalTabs>
    </Dialog>
  );
}

export function PreferencesProvider({ children }) {
  return (
    <>
      <Preferences />
      {children}
    </>
  );
}
