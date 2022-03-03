import { wrap } from './helpers';
import { match } from './relations/relations';
import { findCommonPrefix } from './../..';

export const networkFlowKinds = [
  ['VirtualService', 'Gateway'],
  ['APIRule', 'Function'],
  'Service',
  'Pod',
  ['Secret', 'ConfigMap'],
  'ServiceAccount',
];

export const networkFlowResources = [
  'APIRule',
  'Deployment',
  'Function',
  'ReplicaSet',
  'Pod',
  'Service',
  'VirtualService',
];

function isWorkloadLayer(layer) {
  return layer[0].kind === 'Pod';
}

// lhead overrides actual arrow end
function makeEdge(id1, id2, { lhead } = {}) {
  const lHeadStr = lhead ? `[lhead="${lhead}"]` : '';
  const edge = `"${id1}" -> "${id2}"`;
  return `${edge} ${lHeadStr}`;
}

export function buildNetworkGraph({ store }) {
  const layers = networkFlowKinds
    .map(kind => {
      if (typeof kind === 'string') {
        // single kind
        return store[kind];
      } else {
        // multiple kinds
        return kind.flatMap(k => store[k]).filter(Boolean);
      }
    })
    .filter(layer => layer?.length);

  const strLayers = [];
  const strEdges = [];

  for (let i = 0; i < layers.length; i++) {
    const currentLayer = layers[i];
    const nextLayer = layers[i + 1];

    if (isWorkloadLayer(currentLayer) && store['Pod'].length > 0) {
      const multiplePods = store['Pod'].length > 1;
      const podId = multiplePods
        ? 'composite-pod'
        : store['Pod'][0].metadata.uid;
      const podName = multiplePods
        ? findCommonPrefix(
            '',
            store['Pod'].map(pod => pod.metadata.name),
          )
        : store['Pod'][0].metadata.name;

      const label = `Pod\n${wrap(podName)}`;
      let pod = `"${podId}" [label="${label}"][shape=box]`;
      const deployment = store['Deployment']?.[0];
      const replicaSet = store['ReplicaSet']?.[0];
      const hpa = store['HorizontalPodAutoscaler']?.[0];
      if (deployment) {
        pod = `
        subgraph "cluster_${deployment.metadata.uid}" { 
          label="Deployment ${deployment.metadata.name}";
         ${pod}

         ${replicaSet ? `"ReplicaSet ${wrap(replicaSet.metadata.name)}"` : ''}
         ${hpa ? `"HPA ${wrap(hpa.metadata.name)}"` : ''}
        }`;
      } else {
        // no wrapping deployment, at least add connection between Pod and RS
        if (!deployment && !!replicaSet) {
          const { name, uid } = replicaSet.metadata;
          strLayers.push(`"${uid}" [label="ReplicaSet ${name}"][shape=box]`);
          strEdges.push(makeEdge(podId, uid));
        }
      }
      strLayers.push(pod);

      // edges for workoad layer: connect pod to resources below
      if (nextLayer) {
        nextLayer.forEach(resource => {
          strEdges.push(makeEdge(podId, resource.metadata.uid));
        });
      }
    } else {
      const nodesForLayer = currentLayer
        .map(resource => {
          const id = resource.metadata.uid;
          const label = `${resource.kind}\n${wrap(resource.metadata.name)}`;
          return `"${id}" [label="${label}"][shape=box];`;
        })
        .join('\n');

      // nodes in the same rank should be on the same y position
      // {rank=same; "id1"; "id2"...}
      const rank = `{rank=same; ${currentLayer
        .map(resource => `"${resource.metadata.uid}";`)
        .join(' ')}}`;

      strLayers.push(`${nodesForLayer}\n${rank}`);

      if (!nextLayer) continue;
      // normal layers, connect matching resources
      if (!isWorkloadLayer(nextLayer)) {
        for (const layerResource of currentLayer) {
          for (const nextLayerResource of nextLayer) {
            // connect if match exists
            if (match(layerResource, nextLayerResource)) {
              strEdges.push(
                makeEdge(
                  layerResource.metadata.uid,
                  nextLayerResource.metadata.uid,
                ),
              );
            }
          }
        }
      } else {
        // next layer is Workload layer, so match the Service here
        if (currentLayer[0].kind === 'Service') {
          const deployment = store['Deployment']?.[0];
          const multiplePods = store['Pod']?.length > 1;
          const podId = multiplePods
            ? 'composite-pod'
            : store['Pod'][0].metadata.uid;
          if (!!deployment && store['Pod']?.length) {
            currentLayer.forEach(svc => {
              strEdges.push(
                makeEdge(svc.metadata.uid, podId, {
                  lhead: `cluster_${deployment.metadata.uid}`,
                }),
              );
            });
          }
        }
      }
    }
  }

  return `digraph "Graph" {
    compound="true";
    ranksep="1.0";
    fontname="sans-serif";

    ${strLayers.join('\n\t')}
    ${strEdges.join('\n\t')}
    }`;
}
