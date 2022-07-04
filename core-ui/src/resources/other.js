import React from 'react';

import customResourceDetails from './other/CustomResourceDetails.routes';
import customResourceListOfType from './other/CustomResourceListOfType.routes.js';
import customResourcesByGroup from './other/CustomResourcesByGroup.routes.js';
import noPermissions from './other/noPermissions.routes';
import nodeOverview from './other/nodeOverview.routes';
import clusterList from './other/clusters.routes';
import preferences from './other/preferences.routes';
import appServiceDetails from './other/appServiceDetails.routes';
import containerDetails from './other/containerDetails.routes';
import helmReleasesList from './other/helmReleasesList.routes';
import helmReleaseDetails from './other/helmReleaseDetails.routes';

const other = (
  <>
    {customResourceDetails}
    {customResourceListOfType}
    {customResourcesByGroup}
    {noPermissions}
    {nodeOverview}
    {clusterList}
    {preferences}
    {appServiceDetails}
    {containerDetails}
    {helmReleasesList}
    {helmReleaseDetails}
  </>
);

export default other;
