import React from 'react';

import noPermissions from './other/noPermissions';
import nodeOverview from './other/nodeOverview';
import clusterList from './other/clusters';
import preferences from './other/preferences';
import appServiceDetails from './other/appServiceDetails';
import containerDetails from './other/containerDetails';
import helmReleasesList from './other/helmReleasesList';
import helmReleaseDetails from './other/helmReleaseDetails';
import CRDetails from './other/CRDetails';

const other = (
  <>
    {noPermissions}
    {nodeOverview}
    {clusterList}
    {preferences}
    {appServiceDetails}
    {containerDetails}
    {helmReleasesList}
    {helmReleaseDetails}
    {CRDetails}
  </>
);

export default other;
