import LuigiClient from '@luigi-project/client';
import { Shellbar } from 'fundamental-react';
import { isEqual } from 'lodash';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clustersState } from 'state/clustersAtom';
import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import { namespacesState } from 'state/namespacesAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { K8sResource } from 'state/types';

import { Logo } from './Logo/Logo';
import { NamespaceDropdown } from './NamespaceDropdown';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';

import './Header.scss';

export function Header() {
  const [activeCluster, setActiveCluster] = useRecoilState(
    activeClusterNameState,
  );
  const [activeNamespace, setActiveNamespace] = useRecoilState(
    activeNamespaceIdState,
  );
  const [namespaces, setNamespaces] = useRecoilState(namespacesState);
  const arePreferencesOpen = useSetRecoilState(isPreferencesOpenState);

  const clusters = useRecoilValue(clustersState);
  const config = useRecoilValue(configFeaturesState);
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const hiddenNamespaces = config?.HIDDEN_NAMESPACES?.config?.namespaces;

  const { data, refetch } = useGetList()('/api/v1/namespaces', {
    skip: !config?.REACT_NAVIGATION?.isEnabled,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    data: Array<K8sResource> | null;
    refetch: () => void;
  };

  const filteredNamespaces = data
    ?.map((n: K8sResource) => n.metadata?.name)
    ?.filter(n => {
      if (showHiddenNamespaces) return true;
      return !hiddenNamespaces.includes(n);
    });

  useEffect(() => {
    if (
      filteredNamespaces &&
      !isEqual(namespaces?.[activeCluster], filteredNamespaces)
    ) {
      setNamespaces(prev => ({ ...prev, [activeCluster]: filteredNamespaces }));
    }
  }, [filteredNamespaces, activeCluster, namespaces, setNamespaces]);

  if (!config?.REACT_NAVIGATION?.isEnabled) return null;

  const clustersNames =
    Object.keys(clusters || {})?.filter(name => name !== activeCluster) || [];

  const clustersList = [
    ...clustersNames.map(name => ({
      name,
      callback: () => {
        setActiveNamespace('');
        setActiveCluster(name);
      },
    })),
    {
      name: 'Clusters Overview',
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
      productTitle={activeCluster || 'Clusters'}
      productMenu={clustersList}
      profile={{
        glyph: 'customer',
        colorAccent: 10,
      }}
      actions={[
        {
          glyph: 'megamenu',
          label: activeNamespace || 'Select Namespace...',
          notificationCount: 0,
          callback: () => refetch(),
          menu: <NamespaceDropdown namespaces={namespaces} />,
        },
      ]}
      profileMenu={[
        {
          name: 'Settings',
          callback: (_: any) => arePreferencesOpen(true),
        },
      ]}
    />
  );
}
