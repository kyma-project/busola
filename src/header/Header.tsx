import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  Avatar,
  ShellBar,
  ShellBarItem,
  ToggleButton,
} from '@ui5/webcomponents-react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { useFeature } from 'hooks/useFeature';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';

import {
  clustersAtomEffectOnSet,
  clustersAtomEffectSetSelf,
} from 'state/clustersAtom';
import { clusterAtom } from 'state/clusterAtom';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { configFeaturesNames } from 'state/types';

import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { ClusterSwitcher } from './ClusterSwitcher/ClusterSwitcher';
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
  const location = useLocation();
  const { navigateSafely } = useFormNavigation();

  useAtom(clustersAtomEffectSetSelf);
  useAtom(clustersAtomEffectOnSet);
  const cluster = useAtomValue(clusterAtom);

  const isOnClustersPage = location.pathname === '/clusters';

  const { isEnabled: isKymaCompanionEnabled, useJoule: usesJoule } = useFeature(
    configFeaturesNames.KYMA_COMPANION,
  );

  const [showCompanion, setShowCompanion] = useAtom(showKymaCompanionAtom);

  useEffect(() => {
    setShowCompanion((prevState) => ({
      ...prevState,
      useJoule: usesJoule,
    }));
  }, [setShowCompanion, usesJoule]);

  const shellbarRef = useRef(null);

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
        startButton={!isOnClustersPage && <SidebarSwitcher />}
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
        content={<ClusterSwitcher />}
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
          !isOnClustersPage && (
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
        {isKymaCompanionEnabled && isSAPUser && !isOnClustersPage && (
          <>
            <ToggleButton
              accessibleName={t('kyma-companion.name')}
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
