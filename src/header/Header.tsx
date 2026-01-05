import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  Avatar,
  ListItemStandard,
  ShellBar,
  ShellBarItem,
  ToggleButton,
} from '@ui5/webcomponents-react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { useFeature } from 'hooks/useFeature';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';

import {
  clustersAtom,
  clustersAtomEffectOnSet,
  clustersAtomEffectSetSelf,
} from 'state/clustersAtom';
import { clusterAtom } from 'state/clusterAtom';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { configFeaturesNames } from 'state/types';

import { Logo } from './Logo/Logo';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { HeaderMenu } from './HeaderMenu';
import { CommandPaletteSearchBar } from 'command-pallette/CommandPalletteUI/CommandPaletteSearchBar';
import { SnowFeature } from './SnowFeature';
import FeedbackPopover from './Feedback/FeedbackPopover';
import JouleChat from 'components/KymaCompanion/JouleChat';

import './Header.scss';
import { GetHelpMenu } from './GetHelpMenu';

export function Header() {
  useAvailableNamespaces();
  const isSAPUser = useCheckSAPUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGetHelpOpen, setIsGetHelpOpen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigateSafely } = useFormNavigation();

  useAtom(clustersAtomEffectSetSelf);
  useAtom(clustersAtomEffectOnSet);
  const cluster = useAtomValue(clusterAtom);
  const clusters = useAtomValue(clustersAtom);

  const { isEnabled: isKymaCompanionEnabled, useJoule: usesJoule } = useFeature(
    configFeaturesNames.KYMA_COMPANION,
  );

  const [showCompanion, setShowCompanion] = useAtom(showKymaCompanionAtom);

  useEffect(() => {
    setShowCompanion((prevState) => ({
      ...prevState,
      useJoule: usesJoule,
    }));
  }, [usesJoule]);

  const shellbarRef = useRef(null);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    (name) => name !== cluster?.name,
  );
  const title =
    window.location.pathname !== '/clusters'
      ? cluster?.contextName || cluster?.name
      : '';

  const clustersList = [
    ...inactiveClusterNames.map((name, index) => {
      return (
        <ListItemStandard key={name} accessibleName={name} data-key={index}>
          {name}
        </ListItemStandard>
      );
    }),
    <ListItemStandard key="all-clusters" accessibleName="all-clusters">
      {t('clusters.overview.title-all-clusters')}
    </ListItemStandard>,
  ];

  return (
    <>
      <ShellBar
        className="header"
        accessibilityAttributes={{
          logo: {
            name: cluster?.name
              ? t('cluster-overview.headers.cluster-overview')
              : t('clusters.overview.title-all-clusters'),
          },
          branding: {
            name: `Selected cluster: ${title}`,
          },
        }}
        startButton={
          window.location.pathname !== '/clusters' && <SidebarSwitcher />
        }
        onLogoClick={() => {
          navigateSafely(() =>
            navigate(
              cluster?.name
                ? `/cluster/${encodeURIComponent(cluster.name)}/overview`
                : '/clusters',
            ),
          );
          setShowCompanion((prevState) => ({
            ...prevState,
            show: false,
            fullScreen: false,
          }));
        }}
        logo={<Logo />}
        primaryTitle={title}
        menuItems={window.location.pathname !== '/clusters' ? clustersList : []}
        onMenuItemClick={(e) => {
          navigateSafely(() => {
            e.detail.item.textContent ===
            t('clusters.overview.title-all-clusters')
              ? navigate('/clusters')
              : navigate(
                  `/cluster/${encodeURIComponent(
                    e.detail.item?.textContent ?? '',
                  )}`,
                );
          });
          setShowCompanion((prevState) => ({
            ...prevState,
            show: false,
            fullScreen: false,
          }));
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
        searchField={
          window.location.pathname !== '/clusters' && (
            <CommandPaletteSearchBar
              shouldFocus={isSearchOpen}
              slot="searchField"
              setShouldFocus={setIsSearchOpen}
              shellbarRef={shellbarRef}
            />
          )
        }
        showSearchField
        onSearchButtonClick={(e) => {
          if (!e.detail.searchFieldVisible) {
            setIsSearchOpen(true);
            return;
          }
          setIsSearchOpen(false);
        }}
        ref={shellbarRef}
      >
        <SnowFeature />
        <FeedbackPopover />
        {isKymaCompanionEnabled &&
          isSAPUser &&
          window.location.pathname !== '/clusters' && (
            <>
              <ToggleButton
                accessibleName="Kyma Companion"
                icon={showCompanion.show ? 'da-2' : 'da'}
                onClick={(e) => {
                  e.preventDefault();
                  setShowCompanion((prevState) => ({
                    ...prevState,
                    show: true,
                    fullScreen: false,
                  }));
                }}
                pressed={showCompanion.show}
                slot="assistant"
              />
              {showCompanion.useJoule && <JouleChat />}
            </>
          )}
        <ShellBarItem
          onClick={() => setIsGetHelpOpen(true)}
          id="openGetHelpMenu"
          icon="sys-help"
          text={t('navigation.menu.get-help')}
        />
      </ShellBar>
      <HeaderMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <GetHelpMenu
        isMenuOpen={isGetHelpOpen}
        onClose={() => setIsGetHelpOpen(false)}
      />
    </>
  );
}
