import React from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import './ClusterOverview.scss';

export function ClusterOverview() {
  return (
    <>
      <button
        onClick={() => {
          throw Error('TEST');
        }}
      >
        Crash
      </button>
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
