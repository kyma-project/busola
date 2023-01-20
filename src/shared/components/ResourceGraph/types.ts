import { NavNode } from 'state/types';
import { K8sResource } from 'types';

type ResourceKind = string;

export type RelationResource = {
  kind: string;
  namespace?: string | null;
  version?: string;
  group?: string;
};

type Relation = {
  resource: RelationResource;
  filter: (resourceA: any, resourceB: any) => boolean;
};

export type IHaveNoIdeaForNameHere = {
  fromKind: string;
  resourceType: string;
  kind: string;
  clusterwide: boolean;
  apiPath: string;
};

export type ResourceRelationConfig = {
  resource?: any;
  relations?: Relation[];
  depth?: number;
  networkFlowLevel?: number;
  networkFlowKind?: boolean;
};

export type ResourceGraphEvents = {
  onRelatedResourcesRefresh: () => void;
  onAllLoaded: () => void;
};

export type ResourceGraphContext = {
  fetch: (url: string) => Promise<any>;
  namespaceNodes: NavNode[];
  clusterNodes: NavNode[];
  namespace: string | null | undefined;
  events: ResourceGraphEvents;
};

export type ResourceGraphStore = Record<
  ResourceKind,
  K8sResource[] | undefined
>;

export type ResourceGraphConfig = Record<
  ResourceKind,
  ResourceRelationConfig | undefined
>;
