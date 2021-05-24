import React from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import { EventsList } from 'components/Predefined';
import './ClusterOverview.scss';

export function ClusterOverview() {
  return (
    <>
      <ClusterOverviewHeader />
      <ClusterNodes />
      <EventsList namespace="kube-system" />
    </>
  );
}
