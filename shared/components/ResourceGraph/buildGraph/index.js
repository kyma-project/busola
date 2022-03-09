import { buildNetworkGraph } from './buildNetworkGraph.js';
import { buildStructuralGraph } from './buildStructuralGraph';

export function buildGraph(data, config) {
  const buildGraphFn = config[data.initialResource.kind]?.networkFlowKind
    ? buildNetworkGraph
    : buildStructuralGraph;

  return buildGraphFn(data, config);
}
