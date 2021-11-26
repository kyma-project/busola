import React from 'react';

import './Preferences.scss';
import NamespaceSettings from './NamespaceSettings';
import ThemeChooser from './ThemeChooser';
import LanguageSettings from './LanguageSettings';
import OtherSettings from './OtherSettings';
import ConfirmationSettings from './ConfirmationSettings';
import { VerticalTabs, Tabs, Tab } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Icon } from 'fundamental-react';

function Preferences() {
  const { t } = useTranslation();

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
        </div>
      </VerticalTabs.Content>
    </VerticalTabs>
  );
}

/* for some mysterious reason hooks fail in root component, so instead a
 * wrapper component has to be exported */
export default () => <Preferences />;
