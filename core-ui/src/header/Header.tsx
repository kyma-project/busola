import LuigiClient from '@luigi-project/client';
import { Shellbar } from 'fundamental-react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';

import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clustersState } from 'state/clustersAtom';
import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';

import { Logo } from './Logo/Logo';
import { NamespaceDropdown } from './NamespaceDropdown/NamespaceDropdown';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';

import './Header.scss';
import { useAvailableNamespaces } from './useAvailableNamespaces';

export function Header() {
  const { t } = useTranslation();
  const [activeCluster, setActiveCluster] = useRecoilState(
    activeClusterNameState,
  );
  const [activeNamespace, setActiveNamespace] = useRecoilState(
    activeNamespaceIdState,
  );
  const setPreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const { namespaces, refetch } = useAvailableNamespaces();

  const clusters = useRecoilValue(clustersState);
  const config = useRecoilValue(configFeaturesState);

  // if (!config?.REACT_NAVIGATION?.isEnabled) return null;

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== activeCluster,
  );

  const clustersList = [
    ...inactiveClusterNames.map(name => ({
      name,
      callback: () => {
        setActiveNamespace('');
        setActiveCluster(name);
      },
    })),
    {
      name: t('clusters.overview.title-all-clusters'),
      callback: () => {
        LuigiClient.linkManager().navigate('/clusters');
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
      productTitle={activeCluster}
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
    />
  );
}
