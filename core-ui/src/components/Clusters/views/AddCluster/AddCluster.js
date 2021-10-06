import React, { useEffect, useState, useRef } from 'react';
import LuigiClient from '@luigi-project/client';

import { AddClusterWizard } from '../../components/AddClusterWizard';

import './AddCluster.scss';

export function AddCluster() {
  const [kubeconfig, setKubeconfig] = useState(undefined);
  const isMounted = useRef();

  useEffect(() => {
    isMounted.current = true;
    return _ => (isMounted.current = false);
  }, []);

  return (
    <AddClusterWizard
      kubeconfig={kubeconfig}
      setKubeconfig={setKubeconfig}
      onCancel={() => {
        LuigiClient.linkManager().navigate('/clusters');
      }}
    />
  );
}
