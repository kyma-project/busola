import { buildNetworkGraph } from 'shared/components/ResourceGraph/buildGraph/buildNetworkGraph';
import { buildStructuralGraph } from 'shared/components/ResourceGraph/buildGraph/buildStructuralGraph';
import { K8sResource } from 'types';
import { ResourceGraphConfig, ResourceGraphStore } from '../types';

export function buildGraph(
  data: { initialResource: K8sResource; store: ResourceGraphStore },
  config: ResourceGraphConfig,
) {
  const buildGraphFn = config[data.initialResource.kind!]?.networkFlowKind
    ? buildNetworkGraph
    : buildStructuralGraph;

  return buildGraphFn(data, config);
}
