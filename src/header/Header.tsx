import { useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Avatar,
  ShellBar,
  ShellBarItem,
  ListItemStandard,
} from '@ui5/webcomponents-react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { useFeature } from 'hooks/useFeature';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';

import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { showKymaCompanionState } from 'state/companion/showKymaCompanionAtom';

import { Logo } from './Logo/Logo';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { HeaderMenu } from './HeaderMenu';
import { CommandPaletteSearchBar } from 'command-pallette/CommandPalletteUI/CommandPaletteSearchBar';
import { SnowFeature } from './SnowFeature';

import { configFeaturesNames } from 'state/types';
import './Header.scss';

export function Header() {
  useAvailableNamespaces();
  const isSAPUser = useCheckSAPUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigateSafely } = useFormNavigation();
  const { isEnabled: isFeedbackEnabled, link: feedbackLink } = useFeature(
    configFeaturesNames.FEEDBACK,
  );

  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);

  const { isEnabled: isKymaCompanionEnabled } = useFeature('KYMA_COMPANION');
  const setShowCompanion = useSetRecoilState(showKymaCompanionState);
  const shellbarRef = useRef(null);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const clustersList = [
    ...inactiveClusterNames.map((name, index) => {
      return (
        <ListItemStandard accessibleName={name} data-key={index}>
          {name}
        </ListItemStandard>
      );
    }),
    <ListItemStandard accessibleName="all-clusters">
      {t('clusters.overview.title-all-clusters')}
    </ListItemStandard>,
  ];

  return (
    <>
      <ShellBar
        className="header"
        accessibilityAttributes={{
          logo: {
            name: 'SAP Kyma logo',
          },
        }}
        startButton={
          window.location.pathname !== '/clusters' && <SidebarSwitcher />
        }
        onLogoClick={() => {
          navigateSafely(() => navigate('/clusters'));
          setShowCompanion({
            show: false,
            fullScreen: false,
          });
        }}
        logo={<Logo />}
        primaryTitle={
          window.location.pathname !== '/clusters'
            ? cluster?.contextName || cluster?.name
            : ''
        }
        menuItems={window.location.pathname !== '/clusters' ? clustersList : []}
        onMenuItemClick={e => {
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
          setShowCompanion({
            show: false,
            fullScreen: false,
          });
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
        onSearchButtonClick={e => {
          if (!e.detail.searchFieldVisible) {
            setIsSearchOpen(true);
            return;
          }
          setIsSearchOpen(false);
        }}
        ref={shellbarRef}
      >
        <SnowFeature />
        {isFeedbackEnabled && (
          <ShellBarItem
            onClick={() => window.open(feedbackLink, '_blank')}
            icon="feedback"
            text={t('navigation.feedback')}
            title={t('navigation.feedback')}
          />
        )}
        {isKymaCompanionEnabled &&
          isSAPUser &&
          window.location.pathname !== '/clusters' && (
            <ShellBarItem
              onClick={() =>
                setShowCompanion({
                  show: true,
                  fullScreen: false,
                })
              }
              icon="da"
              text={t('kyma-companion.name')}
              title={t('kyma-companion.name')}
            />
          )}
      </ShellBar>
      <HeaderMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </>
  );
}
