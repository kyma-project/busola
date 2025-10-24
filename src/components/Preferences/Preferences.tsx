import {
  Button,
  Icon,
  Dialog,
  Bar,
  TabContainerDomRef,
} from '@ui5/webcomponents-react';
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
import { useRef, useState } from 'react';

export function Preferences() {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useAtom(isPreferencesOpenAtom);
  const tabsListRef = useRef<TabContainerDomRef>(null);
  const listRef = useRef<TabContainerDomRef>(null);
  const [tabId, setTabId] = useState(1);
  const [isRightPanel, setIsRightPanel] = useState(false);

  const tabs = [
    {
      title: t('settings.interface.title'),
      description: t('settings.interface.description'),
      icon: (
        <Icon
          style={{ margin: 'auto' }}
          name="accelerated"
          accessibleName={t('settings.interface.title')}
          className="bsl-icon-xl"
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
          accessibleName={t('settings.clusters.title')}
          className="bsl-icon-xl"
        />
      ),
      id: 2,
    },
  ];

  useEventListener(
    'keydown',
    (e) => {
      //@ts-ignore
      const { key } = e;
      if (key === 'ArrowDown' && tabId <= tabs?.length - 1) {
        if (!isRightPanel) {
          setTabId(tabId + 1);
          //@ts-ignore
          listRef?.current?.children[tabId].children[0].focus();
        }
      } else if (key === 'ArrowUp' && tabId > 1) {
        if (!isRightPanel) {
          setTabId(tabId - 1);
          //@ts-ignore
          listRef?.current?.children[tabId - 2].children[0].focus();
        }
      } else if (key === 'ArrowRight') {
        setIsRightPanel(true);
      } else if (key === 'ArrowLeft') {
        setIsRightPanel(false);
      }
    },
    [tabId, tabs],
  );

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
              <Button onClick={handleCloseModal}>
                {t('common.buttons.close')}
              </Button>
            </>
          }
        />
      }
      className="preferences-dialog"
    >
      <VerticalTabs
        tabs={tabs}
        listRef={listRef}
        tabId={tabId}
        onSetTabId={setTabId}
      >
        <VerticalTabs.Content id={1}>
          <TabContainer
            tabLayout="Inline"
            contentBackgroundDesign="Transparent"
            ref={tabsListRef}
          >
            <Tab
              style={{ padding: '-16px -32px' }}
              key="theme-settings"
              text={t('settings.theme')}
            >
              <ThemeChooser
                keyNavigationEnabled={isRightPanel}
                tabsListRef={tabsListRef}
              />
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
          >
            <Tab
              key="cluster-interaction"
              text={t('settings.clusters.interaction.title')}
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
