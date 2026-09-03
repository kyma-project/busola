import { useEffect, useRef, useState } from 'react';
import { SCREEN_SIZE_BREAKPOINT_M } from 'command-pallette/CommandPalletteUI/types';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  Avatar,
  ShellBar,
  type ShellBarDomRef,
} from '@ui5/webcomponents-react';

import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';

import {
  clustersAtomEffectOnSet,
  clustersAtomEffectSetSelf,
} from 'state/clustersAtom';
import { clusterAtom } from 'state/clusterAtom';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';

import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { ClusterSwitcher } from './ClusterSwitcher/ClusterSwitcher';
import { HeaderMenu } from './HeaderMenu';
import { CommandPaletteSearchBar } from 'command-pallette/CommandPalletteUI/CommandPaletteSearchBar';
import { SnowFeature } from './SnowFeature';
import FeedbackPopover from './Feedback/FeedbackPopover';

import { TerminalFeature } from './TerminalFeature';
import { AIAssistantFeature } from './AIAssistantFeature';
import { GetHelpMenu } from './GetHelpMenu';
import { ShellBarAction } from './ShellBarAction';
import './Header.scss';

export function Header() {
  useAvailableNamespaces();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGetHelpOpen, setIsGetHelpOpen] = useState(false);
  const [shellbarWidth, setShellbarWidth] = useState(window.innerWidth);
  const isLargeScreen = shellbarWidth > SCREEN_SIZE_BREAKPOINT_M;
  const shellbarRef = useRef<ShellBarDomRef>(null);

  useEffect(() => {
    const htmlWrapEl = document.getElementById('html-wrap');
    if (!htmlWrapEl) return;
    const observer = new ResizeObserver(() => {
      setShellbarWidth(
        shellbarRef.current?.getBoundingClientRect().width ?? window.innerWidth,
      );
    });
    observer.observe(htmlWrapEl);
    return () => observer.disconnect();
  }, []);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateSafely } = useFormNavigation();

  useAtom(clustersAtomEffectSetSelf);
  useAtom(clustersAtomEffectOnSet);
  const cluster = useAtomValue(clusterAtom);

  const isOnClustersPage = location.pathname === '/clusters';
  const isOnKubeconfigPage = location.pathname === '/kubeconfig';

  const setShowCompanion = useSetAtom(showKymaCompanionAtom);

  return (
    <>
      <ShellBar
        className="header"
        accessibilityAttributes={{
          logo: {
            name: isOnClustersPage
              ? t('clusters.overview.title-all-clusters')
              : t('clusters.overview.title-current-cluster'),
          },
        }}
        startButton={
          !isOnClustersPage && !isOnKubeconfigPage && <SidebarSwitcher />
        }
        onLogoClick={() => {
          navigateSafely(() => {
            if (cluster?.name && !isOnClustersPage) {
              navigate(`/cluster/${encodeURIComponent(cluster.name)}/overview`);
            } else {
              navigate('/clusters');
            }
          });
          setShowCompanion((prevState) => ({
            ...prevState,
            show: false,
            fullScreen: false,
          }));
        }}
        logo={<img alt="SAP" src="/assets/sap-logo.svg" />}
        primaryTitle={t('common.product-title')}
        content={!isOnKubeconfigPage && <ClusterSwitcher />}
        profile={
          <Avatar
            icon="customer"
            colorScheme="Accent6"
            accessibleName={t('navigation.settings.title')}
            id="openShellbarMenu"
          />
        }
        onProfileClick={() => setIsMenuOpen(true)}
        searchField={
          !isOnClustersPage &&
          !isOnKubeconfigPage && (
            <CommandPaletteSearchBar
              shouldFocus={isSearchOpen}
              slot="searchField"
              setShouldFocus={setIsSearchOpen}
              shellbarWidth={shellbarWidth}
            />
          )
        }
        showSearchField={isLargeScreen}
        hideSearchButton={isLargeScreen}
        disableSearchCollapse={isLargeScreen}
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
        <AIAssistantFeature />
        <TerminalFeature />
        <ShellBarAction
          onClick={() => setIsGetHelpOpen(true)}
          id="openGetHelpMenu"
          icon="sys-help"
          text={t('navigation.menu.get-help')}
          title={t('navigation.menu.get-help')}
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
