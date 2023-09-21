import { Button, Icon, Dialog, Bar } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { useEventListener } from 'hooks/useEventListener';
import { TabContainer, Tab } from '@ui5/webcomponents-react';

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
          style={{ margin: 'auto' }}
          name="accelerated"
          aria-label={t('settings.interface.title')}
          className="ui5-icon-xl"
        />
      ),
      id: 1,
    },
    {
      title: t('settings.clusters.title'),
      description: t('settings.clusters.description'),
      icon: (
        <Icon
          style={{ margin: 'auto' }}
          name="database"
          aria-label={t('settings.clusters.title')}
          className="ui5-icon-xl"
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

  useEventListener('keydown', handleCloseWithEscape);

  return (
    <Dialog
      onAfterClose={handleCloseModal}
      open={isModalOpen}
      headerText={t('navigation.preferences.title')}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button onClick={handleCloseModal}>
                {t('common.buttons.close')}
              </Button>
            </>
          }
        />
      }
      className="preferences-dialog"
    >
      <VerticalTabs tabs={tabs} height="100vh">
        <VerticalTabs.Content id={1}>
          <TabContainer
            tabLayout="Inline"
            contentBackgroundDesign="Transparent"
            fixed
          >
            <Tab
              style={{ padding: '-16px -32px' }}
              key="theme-settings"
              text={t('settings.theme')}
            >
              <ThemeChooser />
            </Tab>
            <Tab key="language-settings" text={t('settings.language')}>
              <LanguageSettings />
            </Tab>
            <Tab key="other-settings" text={t('settings.other.title')}>
              <OtherSettings />
            </Tab>
          </TabContainer>
        </VerticalTabs.Content>
        <VerticalTabs.Content id={2}>
          <TabContainer
            tabLayout="Inline"
            contentBackgroundDesign="Transparent"
            fixed
          >
            <Tab
              key="cluster-interaction"
              text={t('settings.clusters.interaction.title')}
            >
              <div>
                <NamespaceSettings />
                <ConfirmationSettings />
                <ProtectedSettings />
              </div>
            </Tab>
            <Tab
              key="resource-validation"
              text={t('settings.clusters.resourcesValidation.title')}
            >
              <ResourceValidationSettings />
            </Tab>
          </TabContainer>
        </VerticalTabs.Content>
      </VerticalTabs>
    </Dialog>
  );
}
