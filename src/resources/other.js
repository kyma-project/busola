import customResourceDetails from './other/CustomResourceDetails.routes';
import customResourceListOfType from './other/CustomResourceListOfType.routes.js';
import customResourcesByGroup from './other/CustomResourcesByGroup.routes.js';
import noPermissions from './other/noPermissions.routes';
import nodeOverview from './other/nodeOverview.routes';
import clusterList from './other/clusters.routes';
import busolaExtensions from './other/BusolaExtensions.routes';

import containerDetails from './other/containerDetails.routes';
import helmReleases from './other/helmReleases.routes';
import kymaModules from './other/kymaModules.routes';

export const otherRoutes = (
  <>
    {customResourceDetails}
    {customResourceListOfType}
    {customResourcesByGroup}
    {noPermissions}
    {nodeOverview}
    {clusterList}
    {busolaExtensions}
    {kymaModules}
  </>
);

export const otherRoutesNamespaced = (
  <>
    {containerDetails}
    {customResourceDetails}
    {customResourceListOfType}
    {customResourcesByGroup}
    {helmReleases}
  </>
);
