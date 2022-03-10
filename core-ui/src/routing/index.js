import React from 'react';

import jobRoutes from './namespaceResources/jobs.routes';
import sidecarsRoutes from './namespaceResources/sidecars.routes';
import cronJobRoutes from './namespaceResources/cronJobs.routes';
import virtualServicesRoutes from './namespaceResources/virtualServices.routes';
import serviceEntriesRoutes from './namespaceResources/serviceEntries.routes';
import statefulSetsRoutes from './namespaceResources/statefulSets.routes';
import servicesRoutes from './namespaceResources/services.routes';
import serviceInstancesRoutes from './namespaceResources/serviceInstances.routes';
import serviceBrokersRoutes from './namespaceResources/serviceBrokers.routes';

import clusterRolesRoutes from './clusterResources/clusterRoles.routes';
import storageClassesRoutes from './clusterResources/storageClases.routes';

const ApplicationRoutes = (
  <>
    {/* namespace resources*/}
    <>
      {/* workloads */}
      {statefulSetsRoutes}
      {jobRoutes}

      {cronJobRoutes}
      {/* istio */}
      {virtualServicesRoutes}
      {sidecarsRoutes}
      {serviceEntriesRoutes}
      {/* discovery and network */}
      {servicesRoutes}
      {/* service management */}
      {serviceInstancesRoutes}
      {serviceBrokersRoutes}
    </>

    {/*cluster resources */}
    <>
      {clusterRolesRoutes}
      {storageClassesRoutes}
    </>
  </>
);

export default ApplicationRoutes;
