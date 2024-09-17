import { createResourceRoutes } from './createResourceRoutes';

//namespaced
import * as Jobs from './Jobs';
import * as CronJobs from './CronJobs';
import * as StatefulSets from './StatefulSets';
import * as Secrets from './Secrets';
import * as Roles from './Roles';
import * as RoleBindings from './RoleBindings';
import * as ReplicaSets from './ReplicaSets';
import * as Pods from './Pods';
import * as PersistentVolumeClaims from './PersistentVolumeClaims';
import * as NetworkPolicies from './NetworkPolicies';
import * as Ingresses from './Ingresses';
import * as Events from './Events';
import * as Deployments from './Deployments';
import * as DaemonSets from './DaemonSets';
import * as ConfigMaps from './ConfigMaps';
import * as ServiceAccounts from './ServiceAccounts';
import * as LimitRanges from './LimitRanges';

// //cluster
import * as ClusterRoles from './ClusterRoles';
import * as StorageClasses from './StorageClasses';
import * as PersistentVolumes from './PersistentVolumes';
import * as Namespaces from './Namespaces';
import * as ClusterEvents from './ClusterEvents';
import * as CustomResourceDefinitions from './CustomResourceDefinitions';
import * as ClusterRoleBindings from './ClusterRoleBindings';
import * as ResourceQuotas from './ResourceQuotas';

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
  Ingresses,
  NetworkPolicies,
  LimitRanges,
  ResourceQuotas,
  // storage
  PersistentVolumeClaims,
  // configuration
  Secrets,
  Roles,
  RoleBindings,
  ConfigMaps,
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
