import LuigiClient from '@luigi-project/client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Shellbar } from 'fundamental-react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { clustersState } from 'state/clustersAtom';

import './Header.scss';

export const Header = () => {
  const { features } = useMicrofrontendContext();
  const [activeCluster, setActiveCluster] = useRecoilState(
    activeClusterNameState,
  );
  const [_, setModalOpen] = useRecoilState(isPreferencesOpenState);
  const clusters = useRecoilValue(clustersState);

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
          alt="SAP"
          src="//unpkg.com/fundamental-styles/dist/images/sap-logo.png"
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
          callback: _ => setModalOpen(true),
        },
      ]}
    />
  );
};
