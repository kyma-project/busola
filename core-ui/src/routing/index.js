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
import gateways from './namespaceResources/gateways.routes';
import eventsNamespace from './namespaceResources/eventsNamespace.routes';
import dnsProvider from './namespaceResources/dnsProviders.routes';
import dnsEntries from './namespaceResources/dnsEntries.routes';
import destinationRules from './namespaceResources/destinationRules.routes';
import deployments from './namespaceResources/deployments.routes';
import daemonSets from './namespaceResources/daemonSets.routes';
import customResourcesDefinitionsNamespace from './namespaceResources/customResourceDefinitionsNs.routes';
import configMaps from './namespaceResources/configMaps.routes';
import certificates from './namespaceResources/certificates.routes';
import authorizationPolicies from './namespaceResources/authorizationPolicies.routes';
import apiRules from './namespaceResources/apiRules.routes';
import addonsConfigurationNamespace from './namespaceResources/addonsConfigurationNamespace.routes';

//cluster
import clusterRoles from './clusterResources/clusterRoles.routes';
import storageClasses from './clusterResources/storageClases.routes';
import persistentVolumes from './clusterResources/persistentVolumes.routes';
import namespaces from './clusterResources/namespaces.routes';
import eventsCluster from './clusterResources/eventsCluster.routes';
import addonsConfigurationCluster from './clusterResources/addonsConfigurationCluster.routes';
import customResourceDefinitionsCl from './clusterResources/customResourceDefinitionsCl.routes';

const Application = (
  <>
    {/* namespace resources*/}
    {eventsNamespace}
    <>
      {/* workloads */}
      {statefulSets}
      {jobs}
      {replicaSets}
      {cronJob}
      {pods}
      {deployments}
      {daemonSets}
      {/* istio */}
      {virtualServices}
      {gateways}
      {sidecars}
      {serviceEntries}
      {destinationRules}
      {authorizationPolicies}
      {/* discovery and network */}
      {services}
      {ingresses}
      {networkPolicies}
      {hpas}
      {apiRules}
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
      {dnsProvider}
      {dnsEntries}
      {customResourcesDefinitionsNamespace}
      {configMaps}
      {certificates}
      {addonsConfigurationNamespace}
    </>

    {/* cluster resources */}
    <>
      {eventsCluster}
      {namespaces}
      {clusterRoles}
      {storageClasses}
      {persistentVolumes}
      {addonsConfigurationCluster}
      {customResourceDefinitionsCl}
    </>
  </>
);

export default Application;
