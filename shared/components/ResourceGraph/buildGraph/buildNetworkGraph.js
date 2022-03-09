import { wrap, makeNode, makeRank, makeCluster } from './helpers';
import { match } from './../relations/relations';
import { findCommonPrefix } from './../../..';

const networkFlowLevels = [
  -3, // virtual services & gateways
  -2, // apirules & functions
  -1, // services
  0, // workloads
  1, // configuration resources
  2, // service accounts
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

// in some cases there are multiple resource of the same type and we don't show them all on network graph
// just get the common part of name with '*' as suffix
function getCombinedResourceName(resources) {
  return resources.length > 1
    ? findCommonPrefix(
        '',
        resources.map(pod => pod.metadata.name),
      ) + '*'
    : resources[0].metadata.name;
}

function getResourcesOnLayers(store, config) {
  const getResourcesForLayer = level => {
    const resourcesOnLevel = [];
    for (const kind in store) {
      if (config[kind]?.networkFlowLevel === level) {
        resourcesOnLevel.push(store[kind]);
      }
    }
    return resourcesOnLevel.flat();
  };

  return networkFlowLevels
    .map(getResourcesForLayer)
    .filter(layer => layer?.length);
}

export function buildNetworkGraph({ store }, config) {
  const layers = getResourcesOnLayers(store, config);

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
      const podName = getCombinedResourceName(store['Pod']);

      const label = `Pod\n${wrap(podName)}`;
      let pod = `"${podId}" [id="${podId}" label="${label}"][shape=box]`;
      // assume only one deployment
      const deployment = store['Deployment']?.[0];
      // and one replicaSet
      const replicaSet = store['ReplicaSet']?.[0];
      const hpas = store['HorizontalPodAutoscaler'] || [];
      if (deployment) {
        pod = makeCluster(
          deployment,
          `${pod}
         ${replicaSet ? makeNode(replicaSet) : ''}
         ${hpas.map(makeNode)}`,
        );
      } else {
        // no wrapping deployment, at least add connection between Pod and RS
        if (!deployment && !!replicaSet) {
          strLayers.push(makeNode(replicaSet));
          strEdges.push(makeEdge(podId, replicaSet.metadata.uid));
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
      strLayers.push(currentLayer.map(makeNode).join('\n'));
      strLayers.push(makeRank(currentLayer));

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
