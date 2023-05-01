import React from 'react';
// import { useRecoilValue } from 'recoil';

import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';

import './ClusterOverview.scss';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  return (
    <>
      <ClusterOverviewHeader />
      <Injections destination="ClusterOverview" slot="details-top" root="" />
      <ClusterNodes />
      <Injections destination="ClusterOverview" slot="details-bottom" />
    </>
  );
}
