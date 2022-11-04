import LuigiClient from '@luigi-project/client';
import { useEffect } from 'react';
import { isEqual } from 'lodash';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Shellbar } from 'fundamental-react';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clustersState } from 'state/clustersAtom';
import { namespacesState } from 'state/namespacesAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { themeState } from 'state/preferences/themeAtom';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import { K8sResource } from 'state/types';

import './Header.scss';

export function Header() {
  const [activeCluster, setActiveCluster] = useRecoilState(
    activeClusterNameState,
  );
  const [activeNamespace, setActiveNamespace] = useRecoilState(
    activeNamespaceIdState,
  );
  const [namespaces, setNamespaces] = useRecoilState(namespacesState);

  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);
  const arePreferencesOpen = useSetRecoilState(isPreferencesOpenState);

  const clusters = useRecoilValue(clustersState);
  const theme = useRecoilValue(themeState);
  const config = useRecoilValue(configFeaturesState);

  //TODO: Filter hidden namespaces
  //TODO: Refetch on dropdown open
  const { data, refetch } = useGetList()('/api/v1/namespaces', {
    skip: !config?.REACT_NAVIGATION?.isEnabled,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as { data: Array<K8sResource> | null; refetch: () => void };

  const ns = data?.map((n: K8sResource) => n.metadata?.name);

  useEffect(() => {
    if (ns && !isEqual(namespaces?.[activeCluster], ns)) {
      setNamespaces(prev => ({ ...prev, [activeCluster]: ns }));
    }
  }, [ns, namespaces, setNamespaces]);

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

  const namespacesOverviewNode = {
    title: 'Namespaces Overview',
    glyph: 'dimension',
    image: '',
    callback: () => {
      setActiveNamespace('');
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate('namespaces/');
    },
  };

  const namespacesDropdownList =
    namespaces?.[activeCluster]?.map(n => ({
      title: n,
      glyph: '',
      image: '',
      callback: () => {
        setActiveNamespace(n);
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate('namespaces/' + n);
      },
    })) || [];

  const namespacesDropdown = {
    label: activeNamespace || 'Select Namespace...',
    compact: true,
    callback: () => {
      refetch();
    },
  };

  return (
    <Shellbar
      className="header"
      logo={
        <img
          alt="Kyma"
          src={theme === 'hcw' ? '/assets/logo-black.svg' : '/assets/logo.svg'}
        />
      }
      productTitle={activeCluster || 'Clusters'}
      productMenu={clustersList}
      productSwitch={namespacesDropdown}
      productSwitchList={[namespacesOverviewNode, ...namespacesDropdownList]}
      profile={{
        glyph: 'customer',
        colorAccent: 10,
      }}
      profileMenu={[
        {
          name: 'Settings',
          callback: (_: any) => arePreferencesOpen(true),
        },
        {
          name: '| | |',
          callback: (_: any) => setSidebarCondensed(prevState => !prevState),
        },
      ]}
    />
  );
}
