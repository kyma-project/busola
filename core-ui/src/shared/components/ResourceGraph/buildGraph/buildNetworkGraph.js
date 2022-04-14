import {
  wrap,
  makeNode,
  makeRank,
  makeCluster,
  match,
} from 'shared/components/ResourceGraph/buildGraph/helpers';
import { findCommonPrefix } from 'shared/utils/helpers';

function isWorkloadLayer(layers) {
  return (layers || []).some(layer => layer.kind === 'Pod');
}
const DEPLOYMENT_SUBGRAPH_ITEMS = [
  { kind: 'Pod', required: true, root: true },
  { kind: 'Deployment', required: true },
  { kind: 'ReplicaSet', required: false },
  { kind: 'HorizontalPodAutoscaler', required: false },
];

function canDrawWorkload(store) {
  return DEPLOYMENT_SUBGRAPH_ITEMS.every(item => {
    return item.required ? store[item.kind]?.length > 0 : true;
  });
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

function getResourcesOnLayers(store, config, extract) {
  const getResourcesForLayer = level => {
    const resourcesOnLevel = [];
    for (const kind in store) {
      if (
        extract &&
        DEPLOYMENT_SUBGRAPH_ITEMS.some(i => (i.root ? false : i.kind === kind))
      ) {
        continue;
      } else if (config[kind]?.networkFlowLevel === level) {
        resourcesOnLevel.push(store[kind]);
      }
    }
    return resourcesOnLevel.flat();
  };

  const networkFlowLevels = Object.values(config)
    .map(c => c.networkFlowLevel)
    .filter(c => typeof c === 'number');
  const minLevel = Math.min(...networkFlowLevels);
  const maxLevel = Math.max(...networkFlowLevels);

  const layers = [];
  for (let i = minLevel; i <= maxLevel; i++) {
    layers.push(getResourcesForLayer(i));
  }
  return layers.filter(layer => layer?.length);
}

export function buildNetworkGraph({ store }, config) {
  const isWorkload = canDrawWorkload(store);
  const layers = getResourcesOnLayers(store, config, isWorkload);

  const strLayers = [];
  const strEdges = [];

  for (let i = 0; i < layers.length; i++) {
    const currentLayer = layers[i];
    const nextLayer = layers[i + 1];

    if (isWorkloadLayer(currentLayer) && isWorkload) {
      for (const layerResource of currentLayer) {
        if (layerResource.kind !== 'Pod') {
          strLayers.push(makeNode(layerResource));
          strLayers.push(makeRank([layerResource]));
          continue;
        }
        const multiplePods = store['Pod'].length > 1;
        const podId = multiplePods
          ? 'composite-pod'
          : store['Pod'][0].metadata.uid;
        const podName = getCombinedResourceName(store['Pod']);

        const label = `Pod\n${wrap(podName)}`;
        let pod = `"${podId}" [id="${podId}" class="pod" margin="0.2,0.2" label="${label}"][shape=box]`;
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
         ${hpas.map(makeNode).join('\n')}`,
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
      }
    } else {
      strLayers.push(currentLayer.map(makeNode).join('\n'));
      strLayers.push(makeRank(currentLayer));

      if (!nextLayer) continue;
      // normal layers, connect matching resources
      if (!(isWorkloadLayer(nextLayer) && isWorkload)) {
        for (const layerResource of currentLayer) {
          for (const nextLayerResource of nextLayer) {
            // connect if match exists
            if (match(layerResource, nextLayerResource, config)) {
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
          const subscriptionIds = store['Subscription']?.map(
            subscription => subscription.metadata.uid,
          );
          currentLayer.forEach(svc => {
            if (!!deployment && store['Pod']?.length) {
              strEdges.push(
                makeEdge(svc.metadata.uid, podId, {
                  lhead: `cluster_${deployment.metadata.uid}`,
                }),
              );
            }
            (subscriptionIds || []).forEach(subscription =>
              strEdges.push(makeEdge(svc.metadata.uid, subscription)),
            );
          });
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
