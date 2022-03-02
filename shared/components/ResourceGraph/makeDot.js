import _ from 'lodash';
import { findCommonPrefix } from '../..';
import { GRAPH_TYPE_STRUCTURAL } from './buildGraph';
import { networkFlow } from './relations/relations';
import { isNode, isEdge } from './ResourceGraph';

export function makeDigraph(nodes, edges) {
  return `digraph "Graph" {
      ranksep="2.0 equally";
      fontname="sans-serif";
  
      ${nodes.join('\n\t')}
      ${edges.join('\n\t')}
        }`;
}

function wrap(str) {
  return _.chunk(str.split(''), 20)
    .map(s => s.join(''))
    .join('\n');
}

export function makeDot(elements, graphType) {
  const makeEdge = e => `"${e.source}" -> "${e.target}"`;

  if (graphType === GRAPH_TYPE_STRUCTURAL) {
    const makeNode = n =>
      `"${n.id}" [label="${n.resource.kind}\n${n.resource.metadata.name}"][shape=box]`;

    const nodes = elements.filter(isNode).map(makeNode);
    const edges = elements.filter(isEdge).map(makeEdge);
    return makeDigraph(nodes, edges);
  } else {
    function makeSth(node, x, y) {
      const podsNodes = elements.filter(n => n.resource?.kind === 'Pod');
      const replicaSetNode = elements.filter(
        n => n.resource?.kind === 'ReplicaSet',
      )[0];

      const podNames = podsNodes.map(pod => pod.resource.metadata.name);
      let pods =
        podNames.length !== 1
          ? `"Pods ${findCommonPrefix('', podNames)}*";`
          : `"Pod ${podNames[0]}";`;

      if (replicaSetNode) {
        pods = `subgraph "cluster-${replicaSetNode.id}" { 
          label="ReplicaSet ${replicaSetNode.resource.metadata.name}";
          ${pods}}
        `;
      }

      return `subgraph "cluster-${node.id}" { 
        label="Deployment ${node.resource.metadata.name}";
        ${pods}
      };
      `;
    }

    const makeNodeOrSth = (node, x, y) =>
      node.resource.kind !== 'Deployment'
        ? `"${node.id}" [label="${node.resource.kind}\n${wrap(
            node.resource.metadata.name,
          )}", pos="${x}, ${y * 2}!"][shape=box]`
        : makeSth(node, x, y);

    let x = 0;
    const nodeLayers = networkFlow
      .map(networkFlowKind => {
        const resourceNodes = elements.filter(
          e => e.resource?.kind === networkFlowKind,
        );
        if (!resourceNodes.length) {
          return [];
        }
        x += 2;
        return resourceNodes.map((node, y) => ({
          nodeOrSth: makeNodeOrSth(node, x, y),
          id: node.id,
          kind: node.resource.kind,
        }));
      })
      .filter(layer => layer.length);

    nodeLayers.unshift([
      {
        // todo translation
        nodeOrSth: `"user-request" [label="User Request", pos="0,0!"][shape=box]`,
        id: 'user-request',
      },
    ]);

    const edges = [];
    for (let i = 0; i < nodeLayers.length - 1; i++) {
      const layer = nodeLayers[i];
      const nextLayer = nodeLayers[i + 1];

      for (const node of layer) {
        for (const nextNode of nextLayer) {
          const fromId =
            node.kind === 'Deployment' ? 'cluster-' + node.id : node.id;
          const toId =
            nextNode.kind === 'Deployment'
              ? 'cluster-' + nextNode.id
              : nextNode.id;

          edges.push({
            source: fromId,
            target: toId,
          });
        }
      }
    }

    return makeDigraph(
      nodeLayers.flatMap(l => l).map(d => d.nodeOrSth),
      edges.map(makeEdge),
    );
  }
}
