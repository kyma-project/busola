import { useEffect, useState } from 'react';
import { createUsageMetrics } from 'components/Nodes/nodeQueries';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import {
  NodeList,
  NodeListItem,
  PodList,
  PodMetricsList,
  ResourceList,
  UsageMetrics,
  UseGetOptions,
} from './types';

// Finding capacity for a given usage.
const getAllocatable = (
  nodeName: string,
  usage: ResourceList,
  limits: ResourceList,
  nodesItems?: NodeListItem[],
) => {
  const node = nodesItems?.find(node => node.metadata.name === nodeName);
  // If a pod has no limits set, it uses the available capacity from its node.
  const getCapacityFromNode = (isUse: boolean, allocatableItem?: string) =>
    isUse && allocatableItem ? allocatableItem : 0;
  const cpuCapacity =
    limits?.cpu ??
    getCapacityFromNode(
      !!(usage?.cpu ?? false),
      node?.status?.allocatable?.cpu,
    );
  const memoryCapacity =
    limits?.memory ??
    getCapacityFromNode(
      !!(usage?.memory ?? false),
      node?.status?.allocatable?.memory,
    );
  return { cpu: cpuCapacity, memory: memoryCapacity };
};

export function usePodsMetricsQuery(namespace?: string) {
  const [metrics, setMetrics] = useState<UsageMetrics[] | undefined>(undefined);

  // Fetch all data needed for the metrics.
  const {
    data: podMetrics,
    error: podMetricsError,
    loading: metricsLoading,
  } = useGet(
    namespace
      ? `/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods`
      : '/apis/metrics.k8s.io/v1beta1/pods',
    {
      pollingInterval: 4000,
      compareEntireResource: true,
    } as UseGetOptions,
  ) as { data: PodMetricsList | null; error: any; loading: boolean };

  const {
    data: pods,
    error: podsError,
    loading: podsLoading,
  } = useGet(
    namespace ? `/api/v1/namespaces/${namespace}/pods` : '/api/v1/pods',
    { pollingInterval: 5500 } as UseGetOptions,
  ) as { data: PodList | null; error: any; loading: boolean };

  const { data: nodes } = useGet('/api/v1/nodes', {
    pollingInterval: 5500,
  } as UseGetOptions) as { data: NodeList | null };

  useEffect(() => {
    // Collects all fetched data and creates useful metrics.
    if (pods) {
      const podsWithMetrics = pods?.items?.reduce(
        (acc: UsageMetrics[], pod) => {
          const metricsForPod = podMetrics?.items?.find(
            metrics =>
              pod?.metadata?.name &&
              pod?.metadata?.name === metrics?.metadata?.name,
          );
          if (metricsForPod) {
            return [
              ...acc,
              createUsageMetrics(
                {
                  status: {
                    allocatable: getAllocatable(
                      pod.spec.nodeName,
                      metricsForPod?.containers?.[0]?.usage,
                      pod.spec.containers?.[0]?.resources?.limits,
                      nodes?.items,
                    ),
                  },
                },
                { usage: metricsForPod?.containers?.[0].usage },
              ),
            ];
          }
          return acc;
        },
        [],
      );
      setMetrics(podsWithMetrics);
    }
  }, [pods, podMetrics, nodes]);

  return {
    podsMetrics: metrics,
    error: podsError || podMetricsError,
    loading: metricsLoading || podsLoading,
  };
}

// Totals all usage and all capacity.
export function calculateMetrics(podsMetrics?: UsageMetrics[]) {
  const defaultMetrics = {
    cpu: { usage: 0, capacity: 0 },
    memory: { usage: 0, capacity: 0 },
  };
  if (!podsMetrics?.length) return defaultMetrics;

  return podsMetrics.reduce((accData, pod) => {
    return {
      cpu: {
        usage: accData.cpu.usage + (pod?.cpu?.usage ?? 0),
        capacity: accData.cpu.capacity + (pod?.cpu?.capacity ?? 0),
      },
      memory: {
        usage: accData.memory.usage + (pod?.memory?.usage ?? 0),
        capacity: accData.memory.capacity + (pod?.memory?.capacity ?? 0),
      },
    };
  }, defaultMetrics);
}
