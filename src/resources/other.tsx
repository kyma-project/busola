import customResources from 'resources/other/CustomResources.routes';
import noPermissions from './other/noPermissions.routes';
import overview from './other/overview.routes';
import busolaExtensions from './other/BusolaExtensions.routes';

import containerDetails from './other/containerDetails.routes';
import helmReleases from './other/helmReleases.routes';
import kymaModules from './other/kymaModules.routes';

export const overviewRoutes = <>{overview}</>;

export const otherRoutes = (
  <>
    {customResources}
    {noPermissions}
    {busolaExtensions}
    {kymaModules}
  </>
);

export const otherRoutesNamespaced = (
  <>
    {containerDetails}
    {customResources}
    {helmReleases}
  </>
);
