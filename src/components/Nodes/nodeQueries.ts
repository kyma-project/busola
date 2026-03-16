import { useMemo } from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { getBytes, getCpus } from 'shared/helpers/resources';

interface ResourceValues {
  cpu: number;
  memory: number;
}

interface NodeResources {
  limits: ResourceValues;
  requests: ResourceValues;
}

interface UsageMetrics {
  cpu: {
    usage: number;
    capacity: number;
    percentage: string;
    percentageValue: number;
  };
  memory: {
    usage: number;
    capacity: number;
    percentage: string;
    percentageValue: number;
  };
}

const getPercentageFromUsage = (
  value: number,
  total: number,
): number | string => {
  if (total === 0) {
    return 'Unknown' as any;
  }
  return Math.round((100 * value) / total);
};

export const createUsageMetrics = (
  node: any,
  metricsForNode: any,
): UsageMetrics => {
  const cpuUsage = getCpus(metricsForNode?.usage?.cpu);
  const memoryUsage = getBytes(metricsForNode?.usage?.memory);
  const cpuCapacity = getCpus(node?.status?.allocatable?.cpu);
  const memoryCapacity = getBytes(node?.status?.allocatable?.memory);

  const cpuPercentage = getPercentageFromUsage(cpuUsage, cpuCapacity);
  const memoryPercentage = getPercentageFromUsage(memoryUsage, memoryCapacity);

  return {
    cpu: {
      usage: cpuUsage,
      capacity: cpuCapacity,
      percentage: cpuPercentage + '%',
      percentageValue: cpuPercentage as number,
    },
    memory: {
      usage: memoryUsage,
      capacity: memoryCapacity,
      percentage: memoryPercentage + '%',
      percentageValue: memoryPercentage as number,
    },
  };
};

export function useNodesQuery(skip = false) {
  const { data: nodeMetrics, loading: metricsLoading } = useGet(
    '/apis/metrics.k8s.io/v1beta1/nodes',
    {
      pollingInterval: 4000,
      skip,
      compareEntireResource: true,
    } as any,
  );

  const {
    data: nodes,
    error: nodesError,
    loading: nodesLoading,
  } = useGet('/api/v1/nodes', { pollingInterval: 5500, skip } as any);

  const data = useMemo(() => {
    if (nodes) {
      const getNodeMetrics = (node: any) => {
        const metricsForNode = (nodeMetrics as any)?.items?.find(
          (metrics: any) => node?.metadata?.name === metrics?.metadata?.name,
        );
        return createUsageMetrics(node, metricsForNode);
      };

      return (nodes as any).items?.map((n: any) => ({
        ...n,
        metrics: nodeMetrics ? getNodeMetrics(n) : {},
      }));
    }
    return null;
  }, [nodes, nodeMetrics]);

  return {
    nodes: data,
    error: nodesError,
    loading: metricsLoading || nodesLoading,
  };
}

export function useNodeQuery(nodeName: string) {
  const {
    data: nodeMetrics,
    error: metricsError,
    loading: metricsLoading,
  } = useGet(`/apis/metrics.k8s.io/v1beta1/nodes/${nodeName}`, {
    pollingInterval: 3000,
    skip: !nodeName,
  } as any);

  const {
    data: node,
    error: nodeError,
    loading: nodeLoading,
  } = useGet(`/api/v1/nodes/${nodeName}`, {
    pollingInterval: 3000,
    skip: !nodeName,
  } as any);

  const data = useMemo(() => {
    if (node) {
      return {
        node,
        metrics: nodeMetrics ? createUsageMetrics(node, nodeMetrics) : {},
      };
    }
    return null;
  }, [node, nodeMetrics]);

  return {
    data,
    error: metricsError || nodeError,
    loading: metricsLoading || nodeLoading,
  };
}

const emptyResources: NodeResources = {
  limits: {
    cpu: 0,
    memory: 0,
  },
  requests: {
    cpu: 0,
    memory: 0,
  },
};

function addResources(
  a: NodeResources | undefined,
  b: NodeResources | undefined,
): NodeResources {
  if (!a && !b) {
    return structuredClone(emptyResources);
  }
  if (!a) return b ?? structuredClone(emptyResources);
  if (!b) return a;

  return {
    limits: {
      cpu: getCpus(a?.limits?.cpu) + getCpus(b?.limits?.cpu),
      memory: getBytes(a?.limits?.memory) + getBytes(b?.limits?.memory),
    },
    requests: {
      cpu: getCpus(a?.requests?.cpu) + getCpus(b?.requests?.cpu),
      memory: getBytes(a?.requests?.memory) + getBytes(b?.requests?.memory),
    },
  };
}

function sumContainersResources(containers: any[]): NodeResources {
  return containers?.reduce((containerAccu: NodeResources, container: any) => {
    const containerResources = container.resources;
    const updatedResources = addResources(containerAccu, containerResources);
    return updatedResources;
  }, structuredClone(emptyResources));
}

export function calcNodeResources(pods: any): NodeResources {
  const nodeResources =
    pods?.items?.reduce((accumulator: NodeResources, pod: any) => {
      if (pod?.spec?.containers) {
        const containerResources = sumContainersResources(
          pod?.spec?.containers,
        );
        return addResources(accumulator, containerResources);
      }
      return accumulator;
    }, structuredClone(emptyResources)) || structuredClone(emptyResources);

  return {
    limits: {
      cpu: nodeResources.limits.cpu,
      memory: nodeResources.limits.memory,
    },
    requests: {
      cpu: nodeResources.requests.cpu,
      memory: nodeResources.requests.memory,
    },
  };
}

export function useResourceByNode(nodeName: string) {
  const {
    data: pods,
    error,
    loading,
  } = useGet(
    `/api/v1/pods?fieldSelector=spec.nodeName=${nodeName},status.phase!=Failed,status.phase!=Succeeded&limit=500`,
  );

  const nodeResources = useMemo(() => calcNodeResources(pods), [pods]);
  const data = useMemo(() => {
    if (nodeResources) {
      return nodeResources;
    }
    return null;
  }, [nodeResources]);

  return {
    data,
    error,
    loading,
  };
}
