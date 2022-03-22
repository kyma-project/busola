import React from 'react';

import noPermissions from './other/noPermissions.routes';
import nodeOverview from './other/nodeOverview.routes';
import clusterList from './other/clusters.routes';
import preferences from './other/preferences.routes';
import appServiceDetails from './other/appServiceDetails.routes';
import containerDetails from './other/containerDetails.routes';
import helmReleasesList from './other/helmReleasesList.routes';
import helmReleaseDetails from './other/helmReleaseDetails.routes';
import CRDetails from './other/CRDetails.routes';

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
