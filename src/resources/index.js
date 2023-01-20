import { createResourceRoutes } from './createResourceRoutes';

//namespaced
import * as Jobs from './Jobs';
import * as CronJobs from './CronJobs';
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
import * as Ingresses from './Ingresses';
import * as HorizontalPodAutoscalers from './HorizontalPodAutoscalers';
import * as Events from './Events';
import * as Deployments from './Deployments';
import * as DaemonSets from './DaemonSets';
import * as ConfigMaps from './ConfigMaps';
import * as Certificates from './Certificates';
import * as Subscriptions from './Subscriptions';
import * as ServiceAccounts from './ServiceAccounts';

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
  StatefulSets,
  Jobs,
  ReplicaSets,
  CronJobs,
  Pods,
  Deployments,
  DaemonSets,
  // discovery and network
  Services,
  Ingresses,
  NetworkPolicies,
  HorizontalPodAutoscalers,
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
  ConfigMaps,
  Certificates,
  Subscriptions,
  ServiceAccounts,

  // cluster resources
  ClusterEvents,
  Namespaces,
  ClusterRoles,
  StorageClasses,
  PersistentVolumes,
  ClusterRoleBindings,
  CustomResourceDefinitions,
];

export const resourceRoutes = (
  <>{resources?.filter(r => !r.namespaced)?.map(createResourceRoutes)}</>
);
export const resourceRoutesNamespaced = (
  <>{resources?.filter(r => r.namespaced)?.map(createResourceRoutes)}</>
);
