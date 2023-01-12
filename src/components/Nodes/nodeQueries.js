import React from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { usePrometheus } from 'shared/hooks/usePrometheus';

import { isEqual } from 'lodash';

const round = (num, places) =>
  Math.round(num * Math.pow(10, places)) / Math.pow(10, places);

const getPercentageFromUsage = (value, total) => {
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
      percentage: getPercentageFromUsage(cpuUsage, cpuCapacity),
    },
    memory: {
      usage: memoryUsage,
      capacity: memoryCapacity,
      percentage: getPercentageFromUsage(memoryUsage, memoryCapacity),
    },
  };
};

export function useNodesQuery(skip = false) {
  const [data, setData] = React.useState(null);
  const { data: nodeMetrics, loading: metricsLoading } = useGet(
    '/apis/metrics.k8s.io/v1beta1/nodes',
    {
      pollingInterval: 4000,
      skip,
    },
  );

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
    error: nodesError,
    loading: metricsLoading || nodesLoading,
  };
}

const getPercentage = value => {
  return `${Math.round(100 * value)}%`;
};

const formatData = data =>
  data?.map(n => ({
    name: n.node,
    percentage: getPercentage(n.value),
  }));

function usePrometheusCPUQuery(skip = false) {
  const [data, setData] = React.useState(null);

  //TODO USE DIFFERENT QUERIES
  const { data: cpu, error, loading } = usePrometheus({
    defaultQuery: `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster=""}) by (node) / sum(kube_node_status_capacity{cluster="", resource="cpu"}) by (node)`,
    additionalProps: { timeSpan: 60, skip, parseData: false },
  });

  React.useEffect(() => {
    if (cpu) {
      if (!isEqual(cpu, data?.cpuData)) {
        setData({
          data: formatData(cpu),
          cpuData: cpu,
        });
      }
    }
  }, [cpu, data]);

  return {
    data: data?.data,
    error,
    loading,
  };
}

function usePrometheusMemoryQuery(skip = false) {
  const [data, setData] = React.useState(null);

  const { data: memory, error, loading } = usePrometheus({
    defaultQuery: `sum(node_namespace_pod_container:container_memory_working_set_bytes{cluster="", container!=""}) by (node) / sum(kube_node_status_capacity{cluster="", resource="memory"}) by (node)`,
    additionalProps: { timeSpan: 60, skip, parseData: false },
  });
  React.useEffect(() => {
    if (memory) {
      if (!isEqual(memory, data?.memoryData)) {
        setData({
          data: formatData(memory),
          memoryData: memory,
        });
      }
    }
  }, [memory, data]);
  return {
    data: data?.data,
    error,
    loading,
  };
}

export function usePrometheusNodesQuery(skip = false) {
  const [data, setData] = React.useState(null);

  const { data: nodeData, error: nodeError, loading: nodeLoading } = useGet(
    '/api/v1/nodes',
    {
      pollingInterval: 5000,
      skip,
    },
  );

  const { data: cpuData, loading: cpuLoading } = usePrometheusCPUQuery(skip);
  const { data: memoryData, loading: memoryLoading } = usePrometheusMemoryQuery(
    skip,
  );

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
          percentage: matchingNode?.percentage,
        };
      };

      const formattedMetrics = cpuData?.map(n => ({
        name: n?.name,
        cpu: {
          percentage: n?.percentage,
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
  }, [cpuData, memoryData, nodeData, data]);

  return {
    data: data?.data,
    error: nodeError,
    loading: nodeLoading || cpuLoading || memoryLoading || !data?.data,
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
