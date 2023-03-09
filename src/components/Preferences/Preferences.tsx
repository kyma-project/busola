import { Button, Dialog, Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { useEventListener } from 'hooks/useEventListener';
import { Tab } from 'shared/components/Tabs/Tab';
import { Tabs } from 'shared/components/Tabs/Tabs';
import { VerticalTabs } from 'shared/components/VerticalTabs/VerticalTabs';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { showDebugonataState } from 'state/preferences/showDebugonataAtom';
import { useFeature } from 'hooks/useFeature';

import ConfirmationSettings from './ConfirmationSettings';
import LanguageSettings from './LanguageSettings';
import NamespaceSettings from './NamespaceSettings';
import ResourcesValidationSettings from './ResourcesValidationSettings';
import OtherSettings from './OtherSettings';
import ProtectedSettings from './ProtectedSettings';
import ThemeChooser from './ThemeChooser';
import Toggle from './Toggle';

import './Preferences.scss';

export function Preferences() {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useRecoilState(isPreferencesOpenState);
  const { isEnabled: isExtensibilityEnabled } = useFeature('EXTENSIBILITY');
  const { isEnabled: isDevelopmentEnabled } = useFeature('DEVELOPMENT');

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
    ...(isDevelopmentEnabled
      ? [
          {
            title: t('settings.development.title'),
            description: t('settings.development.description'),
            icon: (
              <Icon
                glyph="source-code"
                size="xl"
                ariaLabel={t('settings.development.title')}
              />
            ),
            id: 3,
          },
        ]
      : []),
  ];

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCloseWithEscape = (e: Event) => {
    if ((e as KeyboardEvent).key === 'Escape') handleCloseModal();
  };

  const actions = [
    <Button onClick={handleCloseModal}>{t('common.buttons.close')}</Button>,
  ];

  useEventListener('keydown', handleCloseWithEscape);

  return (
    <Dialog
      show={isModalOpen}
      title={t('navigation.preferences.title')}
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
            <ResourcesValidationSettings />
          </div>
        </VerticalTabs.Content>
        <VerticalTabs.Content id={3}>
          <div>
            {isExtensibilityEnabled && (
              <Toggle
                label={t('settings.development.showDebugonata')}
                state={showDebugonataState}
              />
            )}
          </div>
        </VerticalTabs.Content>
      </VerticalTabs>
    </Dialog>
  );
}
