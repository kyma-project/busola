import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useState } from 'react';
import { Shellbar } from 'fundamental-react';
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

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useAvailableNamespaces();
  const { namespace: activeNamespace } = useUrl();

  const setPreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);

  const [isNamespaceOpen, setIsNamespaceOpen] = useState(false);
  const [isClustersOpen, setIsClustersOpen] = useState(false);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const clustersList = [
    ...inactiveClusterNames.map(name => ({
      name,
      callback: () => {
        navigate(`/cluster/${name}`);
        setIsClustersOpen(false);
      },
    })),
    {
      name: t('clusters.overview.title-all-clusters'),
      callback: () => {
        navigate('/clusters');
        setIsClustersOpen(false);
      },
    },
  ];

  return (
    <Shellbar
      className="header"
      logo={
        <>
          <SidebarSwitcher />
          <Logo />
        </>
      }
      productTitle={cluster?.contextName || cluster?.name}
      productMenu={clustersList}
      profile={{
        glyph: 'customer',
        colorAccent: 10,
      }}
      actions={
        cluster
          ? [
              {
                glyph: 'megamenu',
                label: activeNamespace || t('navigation.select-namespace'),
                notificationCount: 0,
                callback: () => {
                  refetch();
                  setIsNamespaceOpen(!isNamespaceOpen);
                },
                menu: (
                  <NamespaceDropdown
                    hideDropdown={() => setIsNamespaceOpen(false)}
                  />
                ),
              },
            ]
          : []
      }
      profileMenu={[
        {
          name: t('navigation.preferences.title'),
          callback: () => setPreferencesOpen(true),
        },
      ]}
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
    />
  );
}
