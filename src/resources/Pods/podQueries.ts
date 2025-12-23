import { useMemo } from 'react';
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
import { getBytes, getCpus } from 'shared/helpers/resources';

// Finding capacity for a given usage.
const getAllocatable = (
  nodeName: string,
  usage: ResourceList,
  limits: ResourceList,
  nodesItems?: NodeListItem[],
) => {
  const node = nodesItems?.find((node) => node.metadata.name === nodeName);
  // If a pod has no limits set, it uses the available capacity from its node.
  const getCapacityFromNode = (
    isUse: boolean,
    allocatableItem?: string | number,
  ) => (isUse && allocatableItem ? allocatableItem : 0);
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

const sumValuesFromUsageContainers = (
  usageContainers: {
    name: string;
    usage: ResourceList;
  }[],
) => {
  // Sum all values from the container. If all are undefined, we leave them as they are, because it will be important later.
  const isAllCpuUndefined = usageContainers?.every(
    (container) => container?.usage?.cpu === undefined,
  );
  const isAllMemoryUndefined = usageContainers?.every(
    (container) => container?.usage?.memory === undefined,
  );

  const defaultValue = {
    cpu: isAllCpuUndefined ? undefined : 0,
    memory: isAllMemoryUndefined ? undefined : 0,
  };

  return (
    usageContainers?.reduce((accData, container) => {
      return {
        cpu:
          accData.cpu === undefined
            ? undefined
            : accData.cpu + getCpus(container?.usage?.cpu),
        memory:
          accData.memory === undefined
            ? undefined
            : accData.memory + getBytes(container?.usage?.memory),
      };
    }, defaultValue) ?? defaultValue
  );
};

const sumValuesFromLimitsContainers = (
  limitsContainers: {
    name: string;
    resources: {
      limits: ResourceList;
      requests: ResourceList;
    };
  }[],
) => {
  // Sum all values from the container. If all are undefined, we leave them as they are, because it will be important later.
  const isAllCpuUndefined = limitsContainers?.every(
    (container) => container?.resources?.limits?.cpu === undefined,
  );
  const isAllMemoryUndefined = limitsContainers?.every(
    (container) => container?.resources?.limits?.memory === undefined,
  );

  const defaultValue = {
    cpu: isAllCpuUndefined ? undefined : 0,
    memory: isAllMemoryUndefined ? undefined : 0,
  };

  return (
    limitsContainers?.reduce((accData, container) => {
      return {
        cpu:
          accData.cpu === undefined
            ? undefined
            : accData.cpu + getCpus(container?.resources?.limits?.cpu),
        memory:
          accData.memory === undefined
            ? undefined
            : accData.memory + getBytes(container?.resources?.limits?.memory),
      };
    }, defaultValue) ?? defaultValue
  );
};

export function usePodsMetricsQuery(namespace?: string) {
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

  const metrics = useMemo(() => {
    // Collects all fetched data and creates useful metrics.
    if (pods) {
      const podsWithMetrics = pods?.items?.reduce(
        (acc: UsageMetrics[], pod) => {
          const metricsForPod = podMetrics?.items?.find(
            (metrics) =>
              pod?.metadata?.name &&
              pod?.metadata?.name === metrics?.metadata?.name,
          );
          if (metricsForPod) {
            const usages = sumValuesFromUsageContainers(
              metricsForPod?.containers,
            );
            const limits = sumValuesFromLimitsContainers(pod.spec.containers);
            return [
              ...acc,
              createUsageMetrics(
                {
                  status: {
                    allocatable: getAllocatable(
                      pod.spec.nodeName,
                      usages,
                      limits,
                      nodes?.items,
                    ),
                  },
                },
                { usage: usages },
              ),
            ];
          }
          return acc;
        },
        [],
      );
      return podsWithMetrics;
    }
    return undefined;
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
