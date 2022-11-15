import React from 'react';
import { useRecoilValue } from 'recoil';

import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';

import { clusterState } from '../../../../state/clusterAtom';
import { activeClusterNameState } from '../../../../state/activeClusterNameAtom';
import { authDataState } from '../../../../state/authDataAtom';
import './ClusterOverview.scss';

export function ClusterOverview() {
  const cluster = useRecoilValue(clusterState) || {};
  const activeClusterName = useRecoilValue(activeClusterNameState) || {};
  const authData = useRecoilValue(authDataState) || {};

  console.log(cluster, activeClusterName, authData);
  return (
    <>
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
