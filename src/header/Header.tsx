import { useEffect, useRef, useState } from 'react';
import { SCREEN_SIZE_BREAKPOINT_M } from 'command-pallette/CommandPalletteUI/types';
import { useAtom, useAtomValue } from 'jotai';
import {
  Avatar,
  ShellBar,
  ShellBarItem,
  ToggleButton,
  type ShellBarDomRef,
} from '@ui5/webcomponents-react';

import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { useFeature } from 'hooks/useFeature';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import { useAssistantAvailability } from 'components/KymaCompanion/hooks/useAssistantAvailability';

import {
  clustersAtomEffectOnSet,
  clustersAtomEffectSetSelf,
} from 'state/clustersAtom';
import { clusterAtom } from 'state/clusterAtom';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { showTerminalAtom } from 'state/showTerminalAtom';
import { configFeaturesNames } from 'state/types';

import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { ClusterSwitcher } from './ClusterSwitcher/ClusterSwitcher';
import { HeaderMenu } from './HeaderMenu';
import { CommandPaletteSearchBar } from 'command-pallette/CommandPalletteUI/CommandPaletteSearchBar';
import { SnowFeature } from './SnowFeature';
import FeedbackPopover from './Feedback/FeedbackPopover';
import JouleChat from 'components/KymaCompanion/JouleChat';

import { GetHelpMenu } from './GetHelpMenu';
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

  const { showAssistant, useJouleMode } = useAssistantAvailability();
  const showAssistantHere = showAssistant && !isOnClustersPage;

  const { isEnabled: isTerminalEnabled } = useFeature(
    configFeaturesNames.TERMINAL,
  );

  const [showCompanion, setShowCompanion] = useAtom(showKymaCompanionAtom);
  const [showTerminal, setShowTerminal] = useAtom(showTerminalAtom);

  // Close the panel on eligibility change (e.g. cluster switch) rather than swap modes mid-conversation.
  useEffect(() => {
    setShowCompanion((prevState) =>
      prevState.show
        ? { ...prevState, show: false, useJoule: useJouleMode }
        : { ...prevState, useJoule: useJouleMode },
    );
  }, [setShowCompanion, useJouleMode]);

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
            accessibleName="Settings"
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
        {showAssistantHere && (
          <>
            <ToggleButton
              accessibleName={t('kyma-companion.name')}
              icon={showCompanion.show ? 'da-2' : 'da'}
              onClick={(e) => {
                e.preventDefault();
                setShowCompanion((prevState) => ({
                  ...prevState,
                  show: prevState.useJoule ? !prevState.show : true,
                  fullScreen: false,
                }));
              }}
              pressed={showCompanion.show}
              slot="assistant"
            />
            {showCompanion.useJoule && <JouleChat />}
          </>
        )}
        {isTerminalEnabled && !isOnClustersPage && (
          <ToggleButton
            icon="command-line-interfaces"
            accessibleName={t('terminal.name')}
            pressed={showTerminal.isOpen}
            onClick={() =>
              setShowTerminal((prev) => ({ ...prev, isOpen: !prev.isOpen }))
            }
          />
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
