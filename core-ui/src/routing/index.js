import React from 'react';

import jobRoutes from './namespaceResources/jobs.routes';
import sidecarsRoutes from './namespaceResources/sidecars.routes';
import cronJobRoutes from './namespaceResources/cronJobs.routes';
import virtualServicesRoutes from './namespaceResources/virtualServices.routes';
import statefulSetsRoutes from './namespaceResources/statefulSets.routes';

import clusterRolesRoutes from './clusterResources/clusterRoles.routes';
import storageClassesRoutes from './clusterResources/storageClases.routes';

const ApplicationRoutes = (
  <>
    {/* namespace resources*/}
    <>
      {/* workloads */}
      {statefulSetsRoutes}
      {jobRoutes}
      {sidecarsRoutes}
      {cronJobRoutes}
      {/* istio */}
      {virtualServicesRoutes}
    </>
    {/*cluster resources */}
    <>
      {clusterRolesRoutes}
      {storageClassesRoutes}
    </>
  </>
);

export default ApplicationRoutes;
