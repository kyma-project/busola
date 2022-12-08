import _ from 'lodash';
import pluralize from 'pluralize';
import { NavNode } from 'state/types';
import { K8sResource } from 'types';
import { RelationResource, ResourceGraphConfig } from '../types';

export function wrap(str: string, characterCount = 15) {
  return _.chunk(str.split(''), characterCount)
    .map(s => s.join(''))
    .join('\n');
}

export function makeNode(resource: K8sResource) {
  const { kind = '', metadata } = resource;
  const { name, uid } = metadata;
  // first is for rendering engine, second goes into actual DOM element
  return `"${uid}" [id="${uid}" class="${kind.toLowerCase()}" margin="0.2,0.2" label="${kind}\n${wrap(
    name,
  )}"][shape=box]`;
}

// cluster is a subgraph - the id needs to be prefixed with 'cluster'
export function makeCluster(resource: K8sResource, content: string) {
  const { kind = '' } = resource;
  const { uid, name } = resource.metadata;
  return `subgraph "cluster_${uid}" {
    id="${uid}"
    class="${kind.toLowerCase()}"
    label="Deployment ${name}";
      ${content}
    }`;
}

// nodes in the same rank should be on the same y position
// {rank=same; "id1"; "id2"...}
export function makeRank(resources: K8sResource[]) {
  return `{rank=same; ${resources
    .map(resource => `"${resource.metadata.uid}";`)
    .join(' ')}}`;
}

export function match(
  resourceA: K8sResource,
  resourceB: K8sResource,
  config: ResourceGraphConfig,
) {
  const kindA = resourceA.kind!;
  const kindB = resourceB.kind!;

  let matcher = null;
  const relationA = config[kindA]?.relations?.find(
    r => r.resource.kind === kindB,
  );
  const relationB = config[kindB]?.relations?.find(
    r => r.resource.kind === kindA,
  );

  if (relationA) {
    matcher = relationA.filter;
  } else if (relationB) {
    matcher = relationB.filter;
    // order matters!
    [resourceA, resourceB] = [resourceB, resourceA];
  }

  if (matcher) {
    try {
      return matcher(resourceA, resourceB);
    } catch (e) {
      console.debug(e);
    }
  }
  return false;
}

export function findRelatedResources(
  originalResourceKind: string,
  config: ResourceGraphConfig,
) {
  const relations = (config[originalResourceKind]?.relations || []).map(
    ({ resource }) => resource,
  );

  for (const [otherKind, otherConfig] of Object.entries(config)) {
    if (otherKind === originalResourceKind) continue;

    for (const otherRelation of otherConfig?.relations || []) {
      if (otherRelation.resource.kind === originalResourceKind) {
        let otherResource = structuredClone(config[otherKind]!.resource); // clone the resource since it's an immutable Recoil objects
        if (otherRelation.resource.namespace !== undefined) {
          otherResource.namespace = null;
        }
        relations.push(otherResource);
      }
    }
  }

  // remove duplicates ("Pod -> Deployment" is the same as "Deployment -> Pod")
  return relations.filter(
    (relation, i) => relations.findIndex(r => r.kind === relation.kind) === i,
  );
}

export function getApiPath(
  relatedResource: RelationResource,
  nodes: NavNode[],
) {
  // check if (version, group) are defined
  const { version, group } = relatedResource;
  if (version && group) {
    const apiGroup = group ? `apis/${group}` : 'api';
    return `/${apiGroup}/${version}`;
  }

  // fallback to navigation nodes
  return getApiPath2Todo(relatedResource, nodes);
}

export function getApiPath2Todo(resource: { kind: string }, nodes: NavNode[]) {
  const resourceType = pluralize(resource.kind).toLowerCase();

  const node = nodes.find(n => n.resourceType === resourceType);
  if (!node) return undefined;

  if (node.apiGroup) {
    return `/apis/${node.apiGroup}/${node.apiVersion}`;
  } else {
    return `/api/${node.apiVersion}`;
  }
}
