import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Avatar,
  Menu,
  MenuItem,
  Ui5CustomEvent,
  MenuDomRef,
  ShellBar,
  ShellBarItem,
  StandardListItem,
} from '@ui5/webcomponents-react';
import { MenuItemClickEventDetail } from '@ui5/webcomponents/dist/Menu.js';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/useFeature';

import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';

import { Logo } from './Logo/Logo';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import { useGetLegalLinks, LegalLink } from './SidebarMenu/useGetLegalLinks';
import { useGetHelpLinks, GetHelpLink } from './SidebarMenu/useGetHelpLinks';
import { useGetBusolaVersionDetails } from './SidebarMenu/useGetBusolaVersion';

import './Header.scss';
import { isResourceEditedState } from 'state/resourceEditedAtom';

export function Header() {
  useAvailableNamespaces();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnabled: isFeedbackEnabled, link: feedbackLink } = useFeature(
    'FEEDBACK',
  );

  const { githubLink, busolaVersion } = useGetBusolaVersionDetails();
  const legalLinks = useGetLegalLinks();
  const getHelpLinks = useGetHelpLinks();

  const setPreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const nonBreakableSpaces = (number: int): string => {
    let spaces = '';
    for (let i = 0; i < number; i++) {
      spaces += '\u00a0';
    }
    return spaces;
  };

  const clustersList = [
    ...inactiveClusterNames.map((name, index) => {
      return (
        <StandardListItem aria-label={name} data-key={index}>
          {name}
        </StandardListItem>
      );
    }),
    <StandardListItem aria-label="all-clusters">
      {t('clusters.overview.title-all-clusters')}
    </StandardListItem>,
  ];

  const openNewWindow = (link: string) => {
    const newWindow = window.open(link, '_blank', 'noopener, noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const handleMenuItemClick = (
    e: Ui5CustomEvent<MenuDomRef, MenuItemClickEventDetail>,
  ) => {
    const legalLinkUsed = legalLinks.find(x => x.label === e.detail.text);
    const getHelpLinkUsed = getHelpLinks.find(x => x.label === e.detail.text);

    if (e.detail.text === t('navigation.preferences.title')) {
      setPreferencesOpen(true);
    } else if (e.detail.text === t('navigation.menu.give-feedback')) {
      openNewWindow(feedbackLink);
    } else if (legalLinkUsed) {
      openNewWindow(legalLinkUsed.link);
    } else if (
      e.detail.text === `${t('common.labels.version')} ${busolaVersion}`
    ) {
      openNewWindow(githubLink);
    } else if (getHelpLinkUsed) {
      openNewWindow(getHelpLinkUsed.link);
    }
  };

  return (
    <>
      <ShellBar
        className="header"
        startButton={
          window.location.pathname !== '/clusters' && <SidebarSwitcher />
        }
        onLogoClick={() => {
          if (isResourceEdited.isEdited) {
            setIsResourceEdited({ ...isResourceEdited, warningOpen: true });
            return;
          }
          navigate('/clusters');
        }}
        logo={<Logo />}
        primaryTitle={
          window.location.pathname !== '/clusters'
            ? cluster?.contextName || cluster?.name
            : ''
        }
        menuItems={window.location.pathname !== '/clusters' ? clustersList : []}
        onMenuItemClick={e => {
          if (isResourceEdited.isEdited) {
            setIsResourceEdited({ ...isResourceEdited, warningOpen: true });
            return;
          }
          e.detail.item.textContent ===
          t('clusters.overview.title-all-clusters')
            ? navigate('/clusters')
            : navigate(`/cluster/${e.detail.item.textContent}`);
        }}
        profile={
          <Avatar
            icon="customer"
            colorScheme="Accent6"
            accessibleName="Preferences"
            id="openShellbarMenu"
          />
        }
        onProfileClick={() => setIsMenuOpen(true)}
      >
        {isFeedbackEnabled && (
          <ShellBarItem
            onClick={() => window.open(feedbackLink, '_blank')}
            icon="feedback"
            text={t('navigation.feedback')}
          />
        )}
      </ShellBar>
      <Menu
        open={isMenuOpen}
        opener="openShellbarMenu"
        onAfterClose={() => {
          setIsMenuOpen(false);
        }}
        onItemClick={handleMenuItemClick}
      >
        <MenuItem
          onClick={() => setPreferencesOpen(true)}
          key="preferences"
          text={t('navigation.preferences.title')}
          icon="wrench"
        />
        <MenuItem
          key="give-feedback"
          text={t('navigation.menu.give-feedback')}
          icon="feedback"
        />
        <MenuItem
          key="get-help"
          text={t('navigation.menu.get-help')}
          icon="sys-help"
        >
          {getHelpLinks.map((getHelpLint: GetHelpLink) => (
            <MenuItem
              key={getHelpLint.link}
              text={getHelpLint.label}
              icon="inspect"
            />
          ))}
        </MenuItem>
        <MenuItem
          key="legal-information"
          text={t('navigation.menu.legal-information') + nonBreakableSpaces(6)}
          icon="official-service"
        >
          {legalLinks.map((legalLink: LegalLink) => (
            <MenuItem
              key={legalLink.link}
              text={legalLink.label}
              icon="inspect"
            />
          ))}
          <MenuItem
            text={t('common.labels.version')}
            additionalText={busolaVersion}
            icon="inspect"
            startsSection
          />
        </MenuItem>
      </Menu>
    </>
  );
}
