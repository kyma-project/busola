import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { setCluster, deleteCluster } from './shared';

export function ClusterList() {
  const { clusters, currentClusterName } = useMicrofrontendContext();
  if (!clusters) {
    return null;
  }

  return (
    <>
      <ul>
        {Object.entries(clusters).map(([clusterName, cluster]) => (
          <li key={clusterName}>
            {clusterName} {currentClusterName === clusterName && '*'}
            <button
              disabled={currentClusterName === clusterName}
              onClick={() => setCluster(clusterName)}
            >
              set
            </button>
            <button onClick={() => deleteCluster(clusterName)}>delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => LuigiClient.linkManager().navigate('add')}>
        nowy
      </button>
    </>
  );
}
