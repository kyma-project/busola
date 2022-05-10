import React from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import './ClusterOverview.scss';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export function ClusterOverview() {
  const { features } = useMicrofrontendContext();
  return (
    <>
      {JSON.stringify(features['APPLICATIONS'])}
      <p></p>
      {JSON.stringify(features['PROMETHEUS'])}
      <p></p>
      {JSON.stringify(features['EXTERNAL_NODES'])}
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
