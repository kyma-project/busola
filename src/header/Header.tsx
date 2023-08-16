import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useState } from 'react';
import {
  Avatar,
  Button,
  CustomListItem,
  ShellBar,
  ShellBarItem,
  StandardListItem,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { useUrl } from 'hooks/useUrl';

import { Logo } from './Logo/Logo';
import { NamespaceDropdown } from './NamespaceDropdown/NamespaceDropdown';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';

import './Header.scss';
import { useFeature } from 'hooks/useFeature';

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useAvailableNamespaces();
  const { namespace: activeNamespace } = useUrl();
  const { isEnabled: isFeedbackEnabled, link: feedbackLink } = useFeature(
    'FEEDBACK',
  );

  const setPreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);

  const [isNamespaceOpen, setIsNamespaceOpen] = useState(false);
  const [isClustersOpen, setIsClustersOpen] = useState(false);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const clustersList = [
    ...inactiveClusterNames.map((name, index) => {
      return (
        <StandardListItem
          data-key={index}
          onClick={e => {
            e.preventDefault();
            console.log('XDDDD');
          }}
        >
          {name}
        </StandardListItem>
      );
      // name,
      // callback: () => {
      //   navigate(`/cluster/${name}`);
      //   setIsClustersOpen(false);
      // },
    }),
    // {
    //   name: t('clusters.overview.title-all-clusters'),
    //   callback: () => {
    //     navigate('/clusters');
    //     setIsClustersOpen(false);
    //   },
    // },
  ];

  const getNamespaceLabel = () => {
    if (activeNamespace === '-all-') return t('navigation.all-namespaces');
    else return activeNamespace || t('navigation.select-namespace');
  };

  let headerActions = [];
  if (cluster) {
    headerActions.push({
      glyph: 'megamenu',
      label: getNamespaceLabel(),
      notificationCount: 0,
      callback: () => {
        refetch();
        setIsNamespaceOpen(!isNamespaceOpen);
      },
      menu: (
        <NamespaceDropdown hideDropdown={() => setIsNamespaceOpen(false)} />
      ),
    });
  }

  return (
    <>
      <ShellBar
        className="header"
        startButton={<SidebarSwitcher />}
        onLogoClick={() => navigate('/clusters')}
        logo={<Logo />}
        primaryTitle={cluster?.contextName || cluster?.name}
        menuItems={clustersList}
        // onMenuItemClick={e => navigate('/clusters')}
        profile={
          <Avatar
            icon="customer"
            colorScheme="Accent10"
            accessibleName="preferences"
          />
        }
        onProfileClick={() => setPreferencesOpen(true)}
        // actions={headerActions}
        // profileMenu={[
        //   {
        //     name: t('navigation.preferences.title'),
        //     callback: () => setPreferencesOpen(true),
        //   },
        // ]}
        // @ts-ignore
        popoverPropsFor={{
          profileMenu: { 'aria-label': 'topnav-profile-btn' },
          actionMenu: {
            show: isNamespaceOpen,
            onClickOutside: () => setIsNamespaceOpen(false),
            onEscapeKey: () => setIsNamespaceOpen(false),
          },
          productMenu: {
            show: isClustersOpen,
            onClickOutside: () => setIsClustersOpen(false),
            onEscapeKey: () => setIsClustersOpen(false),
            onClick: () => setIsClustersOpen(!isClustersOpen),
          },
        }}
      >
        <ShellBarItem icon="megamenu" text="XDDDD">
          <NamespaceDropdown hideDropdown={() => setIsNamespaceOpen(false)} />
        </ShellBarItem>
        {isFeedbackEnabled && (
          <ShellBarItem
            onClick={() => window.open(feedbackLink, '_blank')}
            icon="feedback"
            text="feedback"
          />
        )}
      </ShellBar>
    </>
  );
}
