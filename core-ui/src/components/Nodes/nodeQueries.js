import React from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { usePrometheus } from 'shared/hooks/usePrometheus';

import { isEqual } from 'lodash';

const round = (num, places) =>
  Math.round(num * Math.pow(10, places)) / Math.pow(10, places);

const percentage = (value, total) => {
  if (total === 0) {
    return 'Unknown';
  }
  return Math.round((100 * value) / total) + '%';
};

const formatCpu = cpuStr => Math.ceil(parseInt(cpuStr || '0') / 1000_000);
const formatMemory = memoryStr =>
  round(parseInt(memoryStr || '0') / 1024 / 1024, 1);

const createUsageMetrics = (node, metricsForNode) => {
  const cpuUsage = formatCpu(metricsForNode?.usage.cpu);
  const memoryUsage = formatMemory(metricsForNode?.usage.memory);
  const cpuCapacity = parseInt(node.status.capacity?.cpu || '0') * 1000;
  const memoryCapacity = formatMemory(node.status.capacity?.memory);

  return {
    cpu: {
      usage: cpuUsage,
      capacity: cpuCapacity,
      percentage: percentage(cpuUsage, cpuCapacity),
    },
    memory: {
      usage: memoryUsage,
      capacity: memoryCapacity,
      percentage: percentage(memoryUsage, memoryCapacity),
    },
  };
};

export function useNodesQuery(skip = false) {
  const [data, setData] = React.useState(null);
  const {
    data: nodeMetrics,
    error: metricsError,
    loading: metricsLoading,
  } = useGet('/apis/metrics.k8s.io/v1beta1/nodes', {
    pollingInterval: 4000,
    skip,
  });

  const {
    data: nodes,
    error: nodesError,
    loading: nodesLoading,
  } = useGet('/api/v1/nodes', { pollingInterval: 5500, skip });

  React.useEffect(() => {
    if (nodes) {
      const getNodeMetrics = node => {
        const metricsForNode = nodeMetrics.items.find(
          metrics => node.metadata.name === metrics.metadata.name,
        );
        return createUsageMetrics(node, metricsForNode);
      };

      setData(
        nodes.items?.map(n => ({
          ...n,
          metrics: nodeMetrics ? getNodeMetrics(n) : {},
        })),
      );
    }
  }, [nodes, nodeMetrics]);

  return {
    nodes: data,
    error: metricsError || nodesError,
    loading: metricsLoading || nodesLoading,
  };
}

function usePrometheusCPUQuery(skip = false) {
  const [data, setData] = React.useState(null);

  //TODO USE DIFFERENT QUERIES
  const {
    data: cpuUsed,
    error: cpuUsedError,
    loading: cpuUsedLoading,
  } = usePrometheus({
    defaultQuery: `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster=""}) by (node)`,
    additionalProps: { timeSpan: 60, skip, parseData: false },
  });
  const {
    data: cpuAvailable,
    error: cpuAvailableError,
    loading: cpuAvailableLoading,
  } = usePrometheus({
    defaultQuery: `sum(kube_node_status_capacity{cluster="", resource="cpu"}) by (node)`,
    additionalProps: { timeSpan: 60, skip, parseData: false },
  });

  React.useEffect(() => {
    if (cpuUsed && cpuAvailable) {
      if (
        !isEqual(cpuUsed, data?.cpuUsed) ||
        !isEqual(cpuAvailable, data?.cpuAvailable)
      ) {
        const getAvailableCapacity = node => {
          const matchingNode = cpuAvailable?.find(
            available => node.name === available.name,
          );
          return matchingNode?.value;
        };

        const formattedData = cpuUsed?.map(n => ({
          name: n.node,
          usage: n.value,
          capacity: getAvailableCapacity(n),
        }));

        setData({
          data: formattedData,
          cpuUsed: cpuUsed,
          cpuAvailable: cpuAvailable,
        });
      }
    }
  }, [cpuUsed, cpuAvailable]);
  return {
    data: data?.data,
    error: cpuUsedError || cpuAvailableError,
    loading: cpuUsedLoading || cpuAvailableLoading,
  };
}

function usePrometheusMemoryQuery(skip = false) {
  const [data, setData] = React.useState(null);

  const {
    data: memoryUsed,
    error: memoryUsedError,
    loading: memoryUsedLoading,
  } = usePrometheus({
    defaultQuery: `sum(node_namespace_pod_container:container_memory_working_set_bytes{cluster="", container!=""}) by (node)`,
    additionalProps: { timeSpan: 60, skip, parseData: false },
  });
  const {
    data: memoryAvailable,
    error: memoryAvailableError,
    loading: memoryAvailableLoading,
  } = usePrometheus({
    defaultQuery: `sum(kube_node_status_capacity{cluster="", resource="cpu"})`,
    additionalProps: { timeSpan: 60, skip, parseData: false },
  });

  React.useEffect(() => {
    if (memoryUsed && memoryAvailable) {
      if (
        !isEqual(memoryUsed, data?.memoryUsed) ||
        !isEqual(memoryAvailable, data?.memoryAvailable)
      ) {
        const getAvailableCapacity = node => {
          const matchingNode = memoryAvailable?.find(
            available => node.name === available.name,
          );
          return matchingNode?.value;
        };

        const formattedData = memoryUsed?.map(n => ({
          name: n.node,
          usage: n.value,
          capacity: getAvailableCapacity(n),
        }));

        setData({
          data: formattedData,
          memoryUsed: memoryUsed,
          memoryAvailable: memoryAvailable,
        });
      }
    }
  }, [memoryUsed, memoryAvailable]);
  return {
    data: data?.data,
    error: memoryUsedError || memoryAvailableError,
    loading: memoryUsedLoading || memoryAvailableLoading,
  };
}

export function usePrometheusNodeQuery(skip = false) {
  const [data, setData] = React.useState(null);

  const { data: nodeData, error: nodeError, loading: nodeLoading } = useGet(
    '/api/v1/nodes',
    {
      pollingInterval: 4000,
      skip,
    },
  );

  const {
    data: cpuData,
    error: cpuError,
    loading: cpuLoading,
  } = usePrometheusCPUQuery(skip);
  const {
    data: memoryData,
    error: memoryError,
    loading: memoryLoading,
  } = usePrometheusMemoryQuery(skip);

  React.useEffect(() => {
    if (
      !isEqual(nodeData, data?.nodeData) ||
      !isEqual(cpuData, data?.cpuData) ||
      !isEqual(memoryData, data?.memoryData)
    ) {
      const getAvailableMemory = node => {
        const matchingNode = memoryData?.find(
          available => node.name === available.name,
        );
        return {
          usage: matchingNode?.usage,
          capacity: matchingNode?.capacity,
        };
      };

      const formattedMetrics = cpuData?.map(n => ({
        name: n?.name,
        cpu: {
          usage: n?.usage,
          capacity: n?.capacity,
        },
        memory: getAvailableMemory(n),
      }));

      const getMetrics = node => {
        const matchingNode = formattedMetrics?.find(
          available => node?.metadata?.name === available.name,
        );
        return {
          cpu: matchingNode?.cpu,
          memory: matchingNode?.memory,
        };
      };

      const formattedData = nodeData?.items?.map(n => ({
        ...n,
        metrics: getMetrics(n),
      }));
      setData({
        data: formattedData,
        cpuData: cpuData,
        memoryData: memoryData,
        nodeData: nodeData,
      });
    }
  }, [cpuData, memoryData]);
  return {
    data: data?.data,
    error: nodeError || cpuError || memoryError,
    loading: nodeLoading || cpuLoading || memoryLoading,
  };
}

export function useNodeQuery(nodeName) {
  const [data, setData] = React.useState(null);
  const {
    data: nodeMetrics,
    error: metricsError,
    loading: metricsLoading,
  } = useGet(`/apis/metrics.k8s.io/v1beta1/nodes/${nodeName}`, {
    pollingInterval: 3000,
  });

  const {
    data: node,
    error: nodeError,
    loading: nodeLoading,
  } = useGet(`/api/v1/nodes/${nodeName}`, { pollingInterval: 3000 });

  React.useEffect(() => {
    if (node) {
      setData({
        node,
        metrics: nodeMetrics ? createUsageMetrics(node, nodeMetrics) : {},
      });
    }
  }, [node, nodeMetrics]);

  return {
    data,
    error: metricsError || nodeError,
    loading: metricsLoading || nodeLoading,
  };
}
