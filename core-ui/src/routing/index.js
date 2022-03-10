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
import pods from './namespaceResources/pods.routes';
import persistentVolumeClaims from './namespaceResources/persistentVolumeClaims.routes';
import oAuth2Clients from './namespaceResources/oAuth2Clients.routes';
import networkPolicies from './namespaceResources/networkPolicies.routes';
import issuers from './namespaceResources/issuers.routes';
import ingresses from './namespaceResources/ingresses.routes';
import hpas from './namespaceResources/hpa.routes';

//cluster
import clusterRoles from './clusterResources/clusterRoles.routes';
import storageClasses from './clusterResources/storageClases.routes';
import persistentVolumes from './clusterResources/persistentVolumes.routes';
import namespaces from './clusterResources/namespaces.routes';

const Application = (
  <>
    {/* namespace resources*/}
    <>
      {/* workloads */}
      {statefulSets}
      {jobs}
      {replicaSets}
      {cronJob}
      {pods}
      {/* istio */}
      {virtualServices}
      {sidecars}
      {serviceEntries}
      {/* discovery and network */}
      {services}
      {ingresses}
      {networkPolicies}
      {hpas}
      {/* storage */}
      {persistentVolumeClaims}
      {/* service management */}
      {serviceInstances}
      {serviceBindings}
      {serviceBrokers}
      {/* configuration */}
      {secrets}
      {roles}
      {roleBindings}
      {oAuth2Clients}
      {issuers}
    </>

    {/* cluster resources */}
    <>
      {namespaces}
      {clusterRoles}
      {storageClasses}
      {persistentVolumes}
    </>
  </>
);

export default Application;
