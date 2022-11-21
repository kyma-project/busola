import { createResourceRoutes } from './createResourceRoutes';

//namespaced
import * as Jobs from './Jobs';
import * as CronJobs from './CronJobs';
import * as VirtualServices from './VirtualServices';
import * as StatefulSets from './StatefulSets';
import * as Services from './Services';
import * as ServiceInstances from './ServiceInstances';
import * as ServiceBindings from './ServiceBindings';
import * as Secrets from './Secrets';
import * as Roles from './Roles';
import * as RoleBindings from './RoleBindings';
import * as ReplicaSets from './ReplicaSets';
import * as Pods from './Pods';
import * as PersistentVolumeClaims from './PersistentVolumeClaims';
import * as OAuth2Clients from './OAuth2Clients';
import * as NetworkPolicies from './NetworkPolicies';
import * as Issuers from './Issuers';
import * as Ingresses from './Ingresses';
import * as HorizontalPodAutoscalers from './HorizontalPodAutoscalers';
import * as Events from './Events';
import * as DnsProviders from './DnsProviders';
import * as DnsEntries from './DnsEntries';
import * as DestinationRules from './DestinationRules';
import * as Deployments from './Deployments';
import * as DaemonSets from './DaemonSets';
import * as ConfigMaps from './ConfigMaps';
import * as Certificates from './Certificates';
import * as APIRules from './APIRules';
import * as Subscriptions from './Subscriptions';
import * as ServiceAccounts from './ServiceAccounts';
import * as GitRepositories from './GitRepositories';
import * as Functions from './Functions';

// //cluster
import * as ClusterRoles from './ClusterRoles';
import * as StorageClasses from './StorageClasses';
import * as PersistentVolumes from './PersistentVolumes';
import * as Namespaces from './Namespaces';
import * as ClusterEvents from './ClusterEvents';
import * as CustomResourceDefinitions from './CustomResourceDefinitions';
import * as ClusterRoleBindings from './ClusterRoleBindings';

export const resources = [
  // namespace resources
  Events,
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
  DestinationRules,
  // discovery and network
  Services,
  Ingresses,
  NetworkPolicies,
  HorizontalPodAutoscalers,
  APIRules,
  // storage
  PersistentVolumeClaims,
  // service management
  ServiceInstances,
  ServiceBindings,
  // configuration
  Secrets,
  Roles,
  RoleBindings,
  OAuth2Clients,
  Issuers,
  DnsProviders,
  DnsEntries,
  ConfigMaps,
  Certificates,
  Subscriptions,
  ServiceAccounts,
  GitRepositories,

  // cluster resources
  ClusterEvents,
  Namespaces,
  ClusterRoles,
  StorageClasses,
  PersistentVolumes,
  ClusterRoleBindings,
  CustomResourceDefinitions,
];

export const resourceRoutes = <>{resources.map(createResourceRoutes)}</>;
