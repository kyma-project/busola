import {
  Button,
  Icon,
  Dialog,
  Bar,
  ListDomRef,
} from '@ui5/webcomponents-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';

import { useEventListener } from 'hooks/useEventListener';
import { TabContainer, Tab } from '@ui5/webcomponents-react';

import { VerticalTabs } from 'shared/components/VerticalTabs/VerticalTabs';
import { isPreferencesOpenAtom } from 'state/preferences/isPreferencesModalOpenAtom';

import ConfirmationSettings from './ConfirmationSettings';
import LanguageSettings from './LanguageSettings';
import NamespaceSettings from './NamespaceSettings';
import ResourceValidationSettings from './ResourceValidation/ResourceValidationSettings';
import OtherSettings from './OtherSettings';
import ProtectedSettings from './ProtectedSettings';
import ThemeChooser from './ThemeChooser';

import './Preferences.scss';
import EditViewSettings from './EditViewSettings';

export function Preferences() {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useAtom(isPreferencesOpenAtom);
  const listRef = useRef<ListDomRef>(null);
  const [tabId, setTabId] = useState(1);

  const tabs = [
    {
      title: t('settings.appearance.title'),
      icon: (
        <Icon
          style={{ margin: 'auto' }}
          name="palette"
          accessibleName={t('settings.appearance.title')}
          className="bsl-icon-xl"
        />
      ),
      id: 1,
      onActivate: () => {
        setTimeout(() => {
          (listRef?.current?.children[0] as HTMLElement)?.focus();
        }, 0);
      },
    },
    {
      title: t('settings.language.title'),
      icon: (
        <Icon
          style={{ margin: 'auto' }}
          name="globe"
          accessibleName={t('settings.language.title')}
          className="bsl-icon-xl"
        />
      ),
      id: 2,
    },
    {
      title: t('settings.general.title'),
      description: t('settings.general.description'),
      icon: (
        <Icon
          style={{ margin: 'auto' }}
          name="database"
          accessibleName={t('settings.general.title')}
          className="bsl-icon-xl"
        />
      ),
      id: 3,
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
      onClose={handleCloseModal}
      open={isModalOpen}
      headerText={t('navigation.preferences.title')}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Transparent" onClick={handleCloseModal}>
                {t('common.buttons.close')}
              </Button>
            </>
          }
        />
      }
      className="preferences-dialog"
    >
      <VerticalTabs tabs={tabs} tabId={tabId} onSetTabId={setTabId}>
        <VerticalTabs.Content id={1}>
          <TabContainer
            tabLayout="Inline"
            contentBackgroundDesign="Transparent"
          >
            <Tab
              style={{ padding: '-16px -32px' }}
              key="theme-settings"
              text={t('settings.theme')}
            >
              <ThemeChooser listRef={listRef} />
            </Tab>
          </TabContainer>
        </VerticalTabs.Content>
        <VerticalTabs.Content id={2}>
          <TabContainer
            tabLayout="Inline"
            contentBackgroundDesign="Transparent"
          >
            <Tab key="language-settings" text={t('settings.language.title')}>
              <LanguageSettings />
            </Tab>
          </TabContainer>
        </VerticalTabs.Content>
        <VerticalTabs.Content id={3}>
          <TabContainer
            tabLayout="Inline"
            contentBackgroundDesign="Transparent"
          >
            <Tab
              key="cluster-interaction"
              text={t('settings.general.interaction.title')}
            >
              <div>
                <NamespaceSettings />
                <ConfirmationSettings />
                <ProtectedSettings />
                <EditViewSettings />
              </div>
            </Tab>
            <Tab
              key="resource-validation"
              text={t('settings.general.resourcesValidation.title')}
            >
              <ResourceValidationSettings />
            </Tab>
            <Tab key="other-settings" text={t('settings.other.title')}>
              <OtherSettings />
            </Tab>
          </TabContainer>
        </VerticalTabs.Content>
      </VerticalTabs>
    </Dialog>
  );
}
