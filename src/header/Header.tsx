import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Avatar,
  ShellBar,
  ShellBarItem,
  ListItemStandard,
} from '@ui5/webcomponents-react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/useFeature';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';

import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { showKymaCompanionState } from 'state/companion/showKymaCompanionAtom';
import { themeState } from 'state/preferences/themeAtom';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';

import { Logo } from './Logo/Logo';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { HeaderMenu } from './HeaderMenu';
import { CommandPaletteSearchBar } from 'command-pallette/CommandPalletteUI/CommandPaletteSearchBar';

import { handleActionIfFormOpen } from 'shared/components/UnsavedMessageBox/helpers';
import { configFeaturesNames } from 'state/types';
import './Header.scss';

const SNOW_STORAGE_KEY = 'snow-animation';

export function Header() {
  useAvailableNamespaces();
  const localStorageSnowEnabled = () => {
    const snowStorage = localStorage.getItem(SNOW_STORAGE_KEY);
    if (snowStorage && typeof JSON.parse(snowStorage) === 'boolean') {
      return JSON.parse(snowStorage);
    }
    return true;
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSnowOpen, setIsSnowOpen] = useState(localStorageSnowEnabled());
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnabled: isFeedbackEnabled, link: feedbackLink } = useFeature(
    configFeaturesNames.FEEDBACK,
  );
  const { isEnabled: isSnowEnabled } = useFeature(configFeaturesNames.SNOW);

  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);
  const [theme] = useRecoilState(themeState);

  const { isEnabled: isKymaCompanionEnabled } = useFeature('KYMA_COMPANION');
  const setShowCompanion = useSetRecoilState(showKymaCompanionState);

  useEffect(() => {
    if (theme === 'sap_horizon_hcb' || theme === 'sap_horizon_hcw') {
      setIsSnowOpen(false);
      localStorage.setItem(SNOW_STORAGE_KEY, JSON.stringify(false));
    }
  }, [theme]);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const handleSnowButtonClick = () => {
    if (isSnowOpen) {
      setIsSnowOpen(false);
      localStorage.setItem(SNOW_STORAGE_KEY, JSON.stringify(false));
    } else {
      setIsSnowOpen(true);
      localStorage.setItem(SNOW_STORAGE_KEY, JSON.stringify(true));
    }
  };

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
      {isSnowOpen && isSnowEnabled && (
        <div className="snowflakes" aria-hidden="true">
          {[...Array(10).keys()].map(key => (
            <div key={`snowflake-${key}`} className="snowflake">
              ❅
            </div>
          ))}
        </div>
      )}
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
          handleActionIfFormOpen(
            isResourceEdited,
            setIsResourceEdited,
            isFormOpen,
            setIsFormOpen,
            () => navigate('/clusters'),
          );
        }}
        logo={<Logo />}
        primaryTitle={
          window.location.pathname !== '/clusters'
            ? cluster?.contextName || cluster?.name
            : ''
        }
        menuItems={window.location.pathname !== '/clusters' ? clustersList : []}
        onMenuItemClick={e => {
          handleActionIfFormOpen(
            isResourceEdited,
            setIsResourceEdited,
            isFormOpen,
            setIsFormOpen,
            () => {
              e.detail.item.textContent ===
              t('clusters.overview.title-all-clusters')
                ? navigate('/clusters')
                : navigate(
                    `/cluster/${encodeURIComponent(
                      e.detail.item?.textContent ?? '',
                    )}`,
                  );
            },
          );
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
          <CommandPaletteSearchBar
            shouldFocus={isSearchOpen}
            slot="searchField"
            setShouldFocus={setIsSearchOpen}
          />
        }
        showSearchField
        onSearchButtonClick={e => {
          if (!e.detail.searchFieldVisible) {
            setIsSearchOpen(true);
            return;
          }
          setIsSearchOpen(false);
        }}
      >
        {isSnowEnabled && (
          <ShellBarItem
            onClick={handleSnowButtonClick}
            icon={isSnowOpen ? 'heating-cooling' : 'activate'}
            text={isSnowOpen ? t('navigation.snow-stop') : t('navigation.snow')}
            title={
              isSnowOpen ? t('navigation.snow-stop') : t('navigation.snow')
            }
          />
        )}
        {isFeedbackEnabled && (
          <ShellBarItem
            onClick={() => window.open(feedbackLink, '_blank')}
            icon="feedback"
            text={t('navigation.feedback')}
            title={t('navigation.feedback')}
          />
        )}
        {isKymaCompanionEnabled && window.location.pathname !== '/clusters' && (
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
