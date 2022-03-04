import { relations } from './../relations/relations';
import { makeEdge, makeNode } from './helpers';

export function buildStructuralGraph({ initialResource, depth, store }) {
  const rootNode = {
    resource: initialResource,
    depth,
  };

  const nodes = [rootNode];
  const edges = [];
  const queue = [rootNode];

  // BFS
  while (!!queue.length) {
    const node = queue.pop();
    if (node.depth <= 0) continue;

    const kind = node.resource.kind;

    if (!relations[kind]) {
      console.warn('relation for kind not found', kind);
      continue;
    }

    for (const relation of relations[kind]) {
      for (const relatedResource of store[relation.kind] || []) {
        // don't backtrack
        if (relatedResource.kind === node.fromKind) {
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

  return `digraph "Graph" {
    fontname="sans-serif";

    ${nodes.map(node => makeNode(node.resource)).join('\n\t')}
    ${edges.map(e => makeEdge(e.fromId, e.toId)).join('\n\t')}
}`;
}
