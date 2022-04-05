import { createResourceRoutes } from './createResourceRoutes';

//namespaced
import * as Jobs from './Jobs';
import * as Sidecars from './Sidecars';
import * as CronJobs from './CronJobs';
// import virtualServices from './namespaceResources/virtualServices.routes';
// import serviceEntries from './namespaceResources/serviceEntries.routes';
import * as StatefulSets from './StatefulSets';
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
// import gitRepositoies from './namespaceResources/gitRepositories.routes';
import * as Functions from './Functions';

// //cluster
// import applications from './clusterResources/applications.routes';
// import clusterRoles from './clusterResources/clusterRoles.routes';
// import storageClasses from './clusterResources/storageClases.routes';
// import persistentVolumes from './clusterResources/persistentVolumes.routes';
import * as Namespaces from './Namespaces';
// import eventsCluster from './clusterResources/eventsCluster.routes';
// import addonsConfigurationCluster from './clusterResources/addonsConfigurationCluster.routes';
// import customResourceDefinitionsCl from './clusterResources/customResourceDefinitionsCl.routes';
// import clusterRoleBindings from './clusterResources/clusterRoleBindings.routes';

export const resources = {
  // // namespace resources
  // eventsNamespace,

  // workloads
  Functions,
  StatefulSets,
  Jobs,
  ReplicaSets,
  CronJobs,
  Pods,
  Deployments,
  // daemonSets,
  // // istio
  // virtualServices,
  // gateways,
  Sidecars,
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
  Namespaces,
  // clusterRoles,
  // storageClasses,
  // persistentVolumes,
  // addonsConfigurationCluster,
  // customResourceDefinitionsCl,
  // clusterRoleBindings,
};

export const routes = Object.values(resources).map(createResourceRoutes);
