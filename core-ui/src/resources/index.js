import { createResourceRoutes } from './createResourceRoutes';

//namespaced
// import jobs from './namespaceResources/jobs.routes';
// import sidecars from './namespaceResources/sidecars.routes';
// import cronJob from './namespaceResources/cronJobs.routes';
// import virtualServices from './namespaceResources/virtualServices.routes';
// import serviceEntries from './namespaceResources/serviceEntries.routes';
// import statefulSets from './namespaceResources/statefulSets.routes';
import * as Services from './Services';
// import serviceInstances from './namespaceResources/serviceInstances.routes';
// import serviceBrokers from './namespaceResources/serviceBrokers.routes';
// import serviceBindings from './namespaceResources/serviceBindings.routes';
// import secrets from './namespaceResources/secrets.routes';
// import roles from './namespaceResources/roles.routes';
// import roleBindings from './namespaceResources/roleBindings.routes';
import * as ReplicaSets from './ReplicaSets';
import * as Pods from './Pods';
// import persistentVolumeClaims from './namespaceResources/persistentVolumeClaims.routes';
// import oAuth2Clients from './namespaceResources/oAuth2Clients.routes';
// import networkPolicies from './namespaceResources/networkPolicies.routes';
// import issuers from './namespaceResources/issuers.routes';
// import ingresses from './namespaceResources/ingresses.routes';
import * as HorizontalPodAutoscalers from './HorizontalPodAutoscalers';
// import gateways from './namespaceResources/gateways.routes';
// import eventsNamespace from './namespaceResources/eventsNamespace.routes';
// import dnsProvider from './namespaceResources/dnsProviders.routes';
// import dnsEntries from './namespaceResources/dnsEntries.routes';
// import destinationRules from './namespaceResources/destinationRules.routes';
import * as Deployments from './Deployments';
// import daemonSets from './namespaceResources/daemonSets.routes';
// import customResourcesDefinitionsNamespace from './namespaceResources/customResourceDefinitionsNs.routes';
// import configMaps from './namespaceResources/configMaps.routes';
// import certificates from './namespaceResources/certificates.routes';
// import authorizationPolicies from './namespaceResources/authorizationPolicies.routes';
// import apiRules from './namespaceResources/apiRules.routes';
// import addonsConfigurationNamespace from './namespaceResources/addonsConfigurationNamespace.routes';
// import subscriptions from './namespaceResources/subscriptions.routes';
// import serviceAccounts from './namespaceResources/serviceAccounts.routes';
// import gitRepositories from './namespaceResources/gitRepositories.routes';
// import functions from './namespaceResources/functions.routes';

// //cluster
// import applications from './clusterResources/applications.routes';
// import clusterRoles from './clusterResources/clusterRoles.routes';
// import storageClasses from './clusterResources/storageClases.routes';
// import persistentVolumes from './clusterResources/persistentVolumes.routes';
import namespaces from './Namespaces';
// import eventsCluster from './clusterResources/eventsCluster.routes';
// import addonsConfigurationCluster from './clusterResources/addonsConfigurationCluster.routes';
// import customResourceDefinitionsCl from './clusterResources/customResourceDefinitionsCl.routes';
// import clusterRoleBindings from './clusterResources/clusterRoleBindings.routes';

export const resources = {
  // // namespace resources
  // eventsNamespace,

  // // workloads
  // functions,
  // statefulSets,
  // jobs,
  // replicaSets,
  // cronJob,
  Pods,
  Deployments,
  // daemonSets,
  // // istio
  // virtualServices,
  // gateways,
  // sidecars,
  // serviceEntries,
  // destinationRules,
  // authorizationPolicies,
  // // discovery and network
  Services,
  // ingresses,
  // networkPolicies,
  HorizontalPodAutoscalers,
  // apiRules,
  // // storage
  // persistentVolumeClaims,
  // // service management
  // serviceInstances,
  // serviceBindings,
  // serviceBrokers,
  // // configuration
  // secrets,
  // roles,
  // roleBindings,
  // oAuth2Clients,
  // issuers,
  // dnsProvider,
  // dnsEntries,
  // customResourcesDefinitionsNamespace,
  // configMaps,
  // certificates,
  // addonsConfigurationNamespace,
  // subscriptions,
  // serviceAccounts,
  // gitRepositories,

  // // cluster resources
  // applications,
  // eventsCluster,
  namespaces,
  // clusterRoles,
  // storageClasses,
  // persistentVolumes,
  // addonsConfigurationCluster,
  // customResourceDefinitionsCl,
  // clusterRoleBindings,
};
export const routes = Object.values(resources).map(createResourceRoutes);
// export const routes = <>
// {Object.entries(resources).map(([key, resource]) => {
// const Route = createResourceRoutes(resource);
// return <Route key={key} />;
// })}
// </>;
