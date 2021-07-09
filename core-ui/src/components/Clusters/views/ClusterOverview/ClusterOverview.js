import React from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import './ClusterOverview.scss';

export default function ClusterOverview() {
  return (
    <>
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
