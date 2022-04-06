import { createResourceRoutes } from './createResourceRoutes';
import transitionalRoutes from './transitionalRoutes';

//namespaced
import * as Jobs from './Jobs';
import * as Sidecars from './Sidecars';
import * as CronJobs from './CronJobs';
import * as VirtualServices from './VirtualServices';
import * as ServiceEntries from './ServiceEntries';
import * as StatefulSets from './StatefulSets';
import * as Services from './Services';
import * as ServiceInstances from './ServiceInstances';
import * as ServiceBrokers from './ServiceBrokers';
import * as ServiceBindings from './ServiceBindings';
import * as Secrets from './Secrets';
import * as Roles from './Roles';
import * as RoleBindings from './RoleBindings';
import * as ReplicaSets from './ReplicaSets';
import * as Pods from './Pods';
import * as PersistentVolumeClaims from './PersistentVolumeClaims';
// import oAuth2Clients from './namespaceResources/oAuth2Clients.routes';
import * as NetworkPolicies from './NetworkPolicies';
// import issuers from './namespaceResources/issuers.routes';
import * as Ingresses from './Ingresses';
import * as HorizontalPodAutoscalers from './HorizontalPodAutoscalers';
import * as Gateways from './Gateways';
// import eventsNamespace from './namespaceResources/eventsNamespace.routes';
// import dnsProvider from './namespaceResources/dnsProviders.routes';
// import dnsEntries from './namespaceResources/dnsEntries.routes';
import * as DestinationRules from './DestinationRules';
import * as Deployments from './Deployments';
import * as DaemonSets from './DaemonSets';
// import customResourcesDefinitionsNamespace from './namespaceResources/customResourceDefinitionsNs.routes';
// import configMaps from './namespaceResources/configMaps.routes';
// import certificates from './namespaceResources/certificates.routes';
import * as AuthorizationPolicies from './AuthorizationPolicies';
import * as ApiRules from './ApiRules';
// import addonsConfigurationNamespace from './namespaceResources/addonsConfigurationNamespace.routes';
// import subscriptions from './namespaceResources/subscriptions.routes';
// import serviceAccounts from './namespaceResources/serviceAccounts.routes';
// import gitRepositoies from './namespaceResources/gitRepositories.routes';
import * as Functions from './Functions';

// //cluster
// import applications from './clusterResources/applications.routes';
import * as ClusterRoles from './ClusterRoles';
// import storageClasses from './clusterResources/storageClases.routes';
// import persistentVolumes from './clusterResources/persistentVolumes.routes';
import * as Namespaces from './Namespaces';
// import eventsCluster from './clusterResources/eventsCluster.routes';
// import addonsConfigurationCluster from './clusterResources/addonsConfigurationCluster.routes';
// import customResourceDefinitionsCl from './clusterResources/customResourceDefinitionsCl.routes';
import * as ClusterRoleBindings from './ClusterRoleBindings';

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
  DaemonSets,
  // istio
  VirtualServices,
  Gateways,
  Sidecars,
  ServiceEntries,
  DestinationRules,
  AuthorizationPolicies,
  // discovery and network
  Services,
  Ingresses,
  NetworkPolicies,
  HorizontalPodAutoscalers,
  ApiRules,
  // // storage
  PersistentVolumeClaims,
  // service management
  ServiceInstances,
  ServiceBindings,
  ServiceBrokers,
  // configuration
  Secrets,
  Roles,
  RoleBindings,
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
  ClusterRoles,
  // storageClasses,
  // persistentVolumes,
  // addonsConfigurationCluster,
  // customResourceDefinitionsCl,
  ClusterRoleBindings,
};

export const routes = (
  <>
    {Object.values(resources).map(createResourceRoutes)}
    {transitionalRoutes}
  </>
);
