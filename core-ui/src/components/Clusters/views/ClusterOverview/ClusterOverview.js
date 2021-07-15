import React from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import './ClusterOverview.scss';
import { Test } from 'react-shared';

export function ClusterOverview() {
  return (
    <>
      <Test />
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
