import { relations } from './relations/relations';

function makeNode({ resource, fromKind, depth }) {
  return {
    id: resource.metadata.uid,
    fromKind,
    resource,
    depth,
  };
}

export function buildStructuralGraph({ initialResource, depth, store }) {
  const rootNode = makeNode({
    resource: initialResource,
    isRoot: true,
    depth,
  });

  const nodes = [rootNode];
  const edges = [];
  const queue = [rootNode];

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

        // add not if not exists
        if (!nodes.find(g => g.id === relatedResource.metadata.uid)) {
          const newNode = makeNode({
            resource: relatedResource,
            depth: node.depth - 1,
            fromKind: kind,
          });
          nodes.push(newNode);
          queue.push(newNode);
        }

        // connect nodes if not connected
        const fromId = node.id;
        const toId = relatedResource.metadata.uid;
        if (
          !edges.find(
            g =>
              (g.fromId === fromId && g.toId === toId) ||
              (g.fromId === toId && g.toId === fromId),
          )
        ) {
          edges.push({
            fromId,
            toId,
          });
        }
      }
    }
  }

  const strNodes = nodes.map(
    node =>
      `"${node.id}" [label="${node.resource.kind}\n${node.resource.metadata.name}"][shape=box]`,
  );
  const strEdges = edges.map(edge => `"${edge.fromId}" -> "${edge.toId}"`);

  return `digraph "Graph" {
    fontname="sans-serif";

    ${strNodes.join('\n\t')}
    ${strEdges.join('\n\t')}
      }`;
}
