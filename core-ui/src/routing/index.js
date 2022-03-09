import React from 'react';
import jobRoutes from './namespaceResources/jobsRoutes';
import cronJobRoutes from './namespaceResources/cronJobsRoutes';
import clusterRolesRoutes from './clusterResources/clusterRolesRoutes';

const ApplicationRoutes = (
  <>
    {/* namespace resources*/}
    <>
      {/* workloads */}
      {jobRoutes}
      {cronJobRoutes}
    </>
    {/*cluster resources */}
    <>{clusterRolesRoutes}</>
  </>
);

export default ApplicationRoutes;
