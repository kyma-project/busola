import { Shellbar } from 'fundamental-react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { useUrl } from 'hooks/useUrl';

import { Logo } from './Logo/Logo';
import { NamespaceDropdown } from './NamespaceDropdown/NamespaceDropdown';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { useAvailableNamespaces } from './useAvailableNamespaces';

import './Header.scss';

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespaces, refetch } = useAvailableNamespaces();
  const { namespace: activeNamespace } = useUrl();

  const setPreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const clustersList = [
    ...inactiveClusterNames.map(name => ({
      name,
      callback: () => {
        navigate(`/cluster/${name}`);
      },
    })),
    {
      name: t('clusters.overview.title-all-clusters'),
      callback: () => {
        navigate('/clusters');
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
      productTitle={cluster?.name}
      productMenu={clustersList}
      profile={{
        glyph: 'customer',
        colorAccent: 10,
      }}
      actions={[
        {
          glyph: 'megamenu',
          label: activeNamespace || t('navigation.select-namespace'),
          notificationCount: 0,
          callback: () => refetch(),
          menu: <NamespaceDropdown namespaces={namespaces} />,
        },
      ]}
      profileMenu={[
        {
          name: t('navigation.preferences.title'),
          callback: () => setPreferencesOpen(true),
        },
      ]}
      // @ts-ignore
      popoverPropsFor={{
        profileMenu: { 'aria-label': 'topnav-profile-btn' },
      }}
    />
  );
}
