import React from 'react';
// import { useRecoilValue } from 'recoil';

import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';

import './ClusterOverview.scss';

export function ClusterOverview() {
  return (
    <>
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
