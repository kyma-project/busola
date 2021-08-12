import React from 'react';

import './Preferences.scss';
import NamespaceSettings from './NamespaceSettings';
import ThemeChooser from './ThemeChooser';
import LanguageSettings from './LanguageSettings';
import ConfirmationSettings from './ConfirmationSettings';
import { VerticalTabs, Tabs, Tab } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Icon } from 'fundamental-react';

export default function Preferences() {
  const { t } = useTranslation();

  const tabs = [
    {
      title: 'Interface',
      description: 'Language, theme',
      icon: <Icon glyph="accelerated" size="xl" ariaLabel="Interface" />,
      id: 1,
    },
    {
      title: 'Clusters',
      description: 'Cluster interaction',
      icon: <Icon glyph="database" size="xl" ariaLabel="Clusters" />,
      id: 2,
    },
  ];
  return (
    <VerticalTabs tabs={tabs} height="508px">
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
        </Tabs>
      </VerticalTabs.Content>
      <VerticalTabs.Content id={2}>
        <div>
          <NamespaceSettings />
          <ConfirmationSettings />
        </div>
      </VerticalTabs.Content>
    </VerticalTabs>
  );
}
