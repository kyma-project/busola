import {
  findRelatedResources,
  makeNode,
  match,
} from 'shared/components/ResourceGraph/buildGraph/helpers';
import { K8sResource } from 'types';
import { ResourceGraphConfig, ResourceGraphStore } from '../types';

function makeEdge(id1: string, id2: string) {
  return `"${id1}" -- "${id2}"`;
}

type Node = {
  resource: K8sResource;
  depth: number;
  fromKind?: string;
};

export function buildStructuralGraph(
  {
    initialResource,
    store,
  }: { initialResource: K8sResource; store: ResourceGraphStore },
  config: ResourceGraphConfig,
) {
  const rootNode = {
    resource: initialResource,
    depth: config[initialResource.kind!]?.depth || Number.POSITIVE_INFINITY,
  };

  const nodes: Node[] = [rootNode];
  const edges = [];
  const queue: Node[] = [rootNode];

  // BFS
  while (!!queue.length) {
    const node = queue.pop()!;
    if (node.depth <= 0) continue;

    const kind = node.resource.kind!;

    for (const relation of findRelatedResources(kind, config)) {
      for (const relatedResource of store[relation.kind] || []) {
        // don't backtrack
        if (relatedResource.kind === node.fromKind) {
          continue;
        }

        if (!match(node.resource, relatedResource, config)) {
          continue;
        }

        // add node if not exists
        if (
          !nodes.find(
            g => g.resource.metadata.uid === relatedResource.metadata.uid,
          )
        ) {
          const newNode = {
            resource: relatedResource,
            depth: node.depth - 1,
            fromKind: kind,
          };
          nodes.push(newNode);
          queue.push(newNode);
        }

        edges.push({
          fromId: node.resource.metadata.uid,
          toId: relatedResource.metadata.uid,
        });
      }
    }
  }

  return `graph "Graph" {
    fontname="sans-serif";

    ${nodes.map(node => makeNode(node.resource)).join('\n\t')}
    ${edges.map(e => makeEdge(e.fromId, e.toId)).join('\n\t')}
}`;
}
