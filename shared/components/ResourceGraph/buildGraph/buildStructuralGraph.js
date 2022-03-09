import { match } from './../relations/relations';
import { makeNode } from './helpers';

function makeEdge(id1, id2) {
  return `"${id1}" -- "${id2}"`;
}

export function buildStructuralGraph({ initialResource, store }, config) {
  const rootNode = {
    resource: initialResource,
    depth: config.depth,
  };

  const nodes = [rootNode];
  const edges = [];
  const queue = [rootNode];

  // BFS
  while (!!queue.length) {
    const node = queue.pop();
    if (node.depth <= 0) continue;

    const kind = node.resource.kind;

    if (!config[kind]?.relations) {
      console.warn(
        'relation for kind not found',
        kind,
        'config:',
        config[kind],
      );
      continue;
    }

    for (const relation of config[kind]?.relations) {
      for (const relatedResource of store[relation.kind] || []) {
        // don't backtrack
        if (relatedResource.kind === node.fromKind) {
          continue;
        }

        if (!match(node.resource, relatedResource)) {
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
