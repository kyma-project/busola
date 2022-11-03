import { useEffect } from 'react';
import { isEqual } from 'lodash';
import LuigiClient from '@luigi-project/client';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Shellbar } from 'fundamental-react';

import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clustersState } from 'state/clustersAtom';
import { namespacesState } from 'state/namespacesAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { themeState } from 'state/preferences/themeAtom';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import './Header.scss';

export const Header = () => {
  const { features } = useMicrofrontendContext();
  const [activeCluster, setActiveCluster] = useRecoilState(
    activeClusterNameState,
  );
  const [activeNamespace, setActiveNamespace] = useRecoilState(
    activeNamespaceIdState,
  );
  const [namespaces, setNamespaces] = useRecoilState(namespacesState);
  const setModalOpen = useSetRecoilState(isPreferencesOpenState);
  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);

  const clusters = useRecoilValue(clustersState);
  const theme = useRecoilValue(themeState);

  const { data, refetch } = useGet('/api/v1/namespaces', {
    skip: !features?.REACT_NAVIGATION?.isEnabled,
  });
  const ns = data?.items?.map(n => n.metadata?.name);

  useEffect(() => {
    if (ns && !isEqual(namespaces, ns)) setNamespaces(ns);
  }, [ns, namespaces, setNamespaces]);

  if (!features?.REACT_NAVIGATION?.isEnabled) return null;

  const clustersNames =
    Object.keys(clusters || {})?.filter(name => name !== activeCluster) || [];

  const clustersList = [
    ...clustersNames.map(name => ({
      name,
      callback: () => {
        setActiveNamespace(null);
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

  const namespacesDropdownList =
    namespaces?.map(n => ({
      title: n,
      callback: () => {
        setActiveNamespace(n);
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate('namespaces/' + n);
      },
    })) || [];

  namespacesDropdownList.unshift({
    title: 'Namespaces Overview',
    glyph: 'dimension',
    callback: () => {
      setActiveNamespace(null);
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate('namespaces/');
    },
  });

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
      productSwitchList={namespacesDropdownList}
      profile={{
        glyph: 'customer',
        colorAccent: 10,
      }}
      profileMenu={[
        {
          name: 'Settings',
          callback: _ => setModalOpen(true),
        },
        {
          name: '| | |',
          callback: _ => setSidebarCondensed(prevState => !prevState),
        },
      ]}
    />
  );
};
