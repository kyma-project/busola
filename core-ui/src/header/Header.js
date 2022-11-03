import LuigiClient from '@luigi-project/client';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Shellbar } from 'fundamental-react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { clustersState } from 'state/clustersAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { themeState } from 'state/preferences/themeAtom';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import './Header.scss';

export const Header = () => {
  const { features } = useMicrofrontendContext();
  const [activeCluster, setActiveCluster] = useRecoilState(
    activeClusterNameState,
  );
  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);

  const arePreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const clusters = useRecoilValue(clustersState);
  const theme = useRecoilValue(themeState);

  if (!features?.REACT_NAVIGATION?.isEnabled) return null;

  const clustersNames =
    Object.keys(clusters || {})?.filter(name => name !== activeCluster) || [];
  const clustersList = [
    ...clustersNames.map(name => ({
      name,
      callback: () => setActiveCluster(name),
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
        <img
          alt="Kyma"
          src={theme === 'hcw' ? '/assets/logo-black.svg' : '/assets/logo.svg'}
        />
      }
      productTitle="Kyma"
      productTitle={activeCluster || 'Clusters'}
      productMenu={clustersList}
      profile={{
        glyph: 'customer', //TODO in fundamental
      }}
      profileMenu={[
        {
          name: 'Settings',
          callback: _ => arePreferencesOpen(true),
        },
        {
          name: '| | |',
          callback: _ => setSidebarCondensed(prevState => !prevState),
        },
      ]}
    />
  );
};
