import React from 'react';

//namespaced
import jobs from './namespaceResources/jobs.routes';
import sidecars from './namespaceResources/sidecars.routes';
import cronJob from './namespaceResources/cronJobs.routes';
import virtualServices from './namespaceResources/virtualServices.routes';
import serviceEntries from './namespaceResources/serviceEntries.routes';
import statefulSets from './namespaceResources/statefulSets.routes';
import services from './namespaceResources/services.routes';
import serviceInstances from './namespaceResources/serviceInstances.routes';
import serviceBrokers from './namespaceResources/serviceBrokers.routes';
import serviceBindings from './namespaceResources/serviceBindings.routes';
import secrets from './namespaceResources/secrets.routes';
import roles from './namespaceResources/roles.routes';
import roleBindings from './namespaceResources/roleBindings.routes';
import replicaSets from './namespaceResources/replicaSets.routes';

//cluster
import clusterRoles from './clusterResources/clusterRoles.routes';
import storageClasses from './clusterResources/storageClases.routes';

const Application = (
  <>
    {/* namespace resources*/}
    <>
      {/* workloads */}
      {statefulSets}
      {jobs}
      {replicaSets}
      {cronJob}
      {/* istio */}
      {virtualServices}
      {sidecars}
      {serviceEntries}
      {/* discovery and network */}
      {services}
      {/* service management */}
      {serviceInstances}
      {serviceBindings}
      {serviceBrokers}
      {/* configuration */}
      {secrets}
      {roles}
      {roleBindings}
    </>

    {/* cluster resources */}
    <>
      {clusterRoles}
      {storageClasses}
    </>
  </>
);

export default Application;
