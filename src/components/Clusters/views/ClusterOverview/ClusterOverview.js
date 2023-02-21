import React from 'react';
// import { useRecoilValue } from 'recoil';

import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';

import './ClusterOverview.scss';
const Widgets = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityWidgets'),
);
export function ClusterOverview() {
  return (
    <>
      <ClusterOverviewHeader />
      <Widgets destination="ClusterOverview" slot="top" />
      <ClusterNodes />
      <Widgets destination="ClusterOverview" slot="bottom" />
    </>
  );
}
