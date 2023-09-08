import { Button } from '@ui5/webcomponents-react';
import { Dialog, Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { useEventListener } from 'hooks/useEventListener';
import { Tabs } from 'shared/components/Tabs/Tabs';
import { VerticalTabs } from 'shared/components/VerticalTabs/VerticalTabs';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';

import ConfirmationSettings from './ConfirmationSettings';
import LanguageSettings from './LanguageSettings';
import NamespaceSettings from './NamespaceSettings';
import ResourceValidationSettings from './ResourceValidation/ResourceValidationSettings';
import OtherSettings from './OtherSettings';
import ProtectedSettings from './ProtectedSettings';
import ThemeChooser from './ThemeChooser';

import './Preferences.scss';

export function Preferences() {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useRecoilState(isPreferencesOpenState);

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
            <div
              style={{ padding: '-16px -32px' }}
              key="theme-settings"
              id="theme-settings"
              title={t('settings.theme')}
            >
              <ThemeChooser />
            </div>
            <div
              key="language-settings"
              id="language-settings"
              title={t('settings.language')}
            >
              <LanguageSettings />
            </div>
            <div
              key="other-settings"
              id="other-settings"
              title={t('settings.other.title')}
            >
              <OtherSettings />
            </div>
          </Tabs>
        </VerticalTabs.Content>
        <VerticalTabs.Content id={2}>
          <Tabs className="fd-tabs fd-has-padding-left-regular">
            <div
              key="cluster-interaction"
              id="cluster-interaction"
              title={t('settings.clusters.interaction.title')}
            >
              <div>
                <NamespaceSettings />
                <ConfirmationSettings />
                <ProtectedSettings />
              </div>
            </div>
            <div
              key="resource-validation"
              id="resource-validation"
              title={t('settings.clusters.resourcesValidation.title')}
            >
              <ResourceValidationSettings />
            </div>
          </Tabs>
        </VerticalTabs.Content>
      </VerticalTabs>
    </Dialog>
  );
}
