import { buildNetworkGraph } from 'shared/components/ResourceGraph/buildGraph/buildNetworkGraph';
import { buildStructuralGraph } from 'shared/components/ResourceGraph/buildGraph/buildStructuralGraph';

export function buildGraph(data, config) {
  const buildGraphFn = config[data.initialResource.kind]?.networkFlowKind
    ? buildNetworkGraph
    : buildStructuralGraph;

  return buildGraphFn(data, config);
}
