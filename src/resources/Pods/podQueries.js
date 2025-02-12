import { createUsageMetrics } from 'components/Nodes/nodeQueries';
import { useEffect, useState } from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

export function usePodsMetricsQuery(namespace) {
  const [metrics, setMetrics] = useState(null);
  const { data: podMetrics, loading: metricsLoading } = useGet(
    namespace
      ? `/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods`
      : '/apis/metrics.k8s.io/v1beta1/pods',
    {
      pollingInterval: 4000,
      compareEntireResource: true,
    },
  );

  const {
    data: pods,
    error: podsError,
    loading: podsLoading,
  } = useGet(
    namespace ? `/api/v1/namespaces/${namespace}/pods` : '/api/v1/pods',
    { pollingInterval: 5500 },
  );

  const { data: nodes } = useGet('/api/v1/nodes', { pollingInterval: 5500 });

  const getAllocatable = (nodeName, usage, limits, nodesItems) => {
    const node = nodesItems?.find(node => node.metadata.name === nodeName);
    const getCapacityFromNode = (isUse, allocatable) =>
      isUse && allocatable ? allocatable : 0;
    const cpuCapacity = limits?.cpu
      ? limits?.cpu
      : getCapacityFromNode(
          usage?.cpu ?? undefined,
          node?.status?.allocatable?.cpu,
        );
    const memoryCapacity = limits?.memory
      ? limits?.memory
      : getCapacityFromNode(
          usage?.memory ?? undefined,
          node?.status?.allocatable?.memory,
        );
    return { cpu: cpuCapacity, memory: memoryCapacity };
  };

  useEffect(() => {
    if (pods) {
      const podsWithMetrics = pods?.items?.reduce((arr, pod) => {
        const metricsForPod = podMetrics?.items?.find(
          metrics =>
            pod?.metadata?.name &&
            pod?.metadata?.name === metrics?.metadata?.name,
        );
        if (metricsForPod) {
          return [
            ...arr,
            createUsageMetrics(
              {
                status: {
                  allocatable: getAllocatable(
                    pod.spec.nodeName,
                    metricsForPod?.containers?.[0].usage,
                    pod.spec.containers[0].resources?.limits,
                    nodes?.items,
                  ),
                },
              },
              { usage: metricsForPod?.containers?.[0].usage },
            ),
          ];
        }
        return arr;
      }, []);
      setMetrics(podsWithMetrics);
    }
  }, [pods, podMetrics, nodes]);

  return {
    podsMetrics: metrics,
    error: podsError,
    loading: metricsLoading || podsLoading,
  };
}

export function calculateMetrics(podsMetrics) {
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
