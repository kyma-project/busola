import {
  buildNetworkGraph,
  networkFlowResources,
} from './buildNetworkGraph.js';
import { buildStructuralGraph } from './buildStructuralGraph';

export function buildGraph(data) {
  const isStructural = !networkFlowResources.includes(
    data.initialResource.kind,
  );

  return isStructural ? buildStructuralGraph(data) : buildNetworkGraph(data);
}
