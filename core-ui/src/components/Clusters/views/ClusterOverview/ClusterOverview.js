import React from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterOverviewData } from './ClusterOverviewData/ClusterOverviewData';
import './ClusterOverview.scss';

export function ClusterOverview() {
  return (
    <>
      <ClusterOverviewHeader />
      <ClusterOverviewData />
    </>
  );
}
