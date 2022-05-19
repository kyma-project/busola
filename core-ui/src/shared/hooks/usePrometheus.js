import LuigiClient from '@luigi-project/client';
import { useEffect, useState } from 'react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

const getPrometheusSelector = data => {
  let selector = `cluster="", container!="", namespace="${data.namespace}"`;
  if (data.pod) {
    let pods = data.pod;
    if (Array.isArray(data.pod)) {
      pods = data.pod.join('|');
    }
    selector = `${selector}, pod=~"${pods}"`;
  }
  return selector;
};

const getPrometheusPVCUsedSpaceQuery = ({ name, namespace }) => {
  return `(
    sum without(instance, node) (topk(1, (kubelet_volume_stats_capacity_bytes{cluster="", job="kubelet", metrics_path="/metrics", namespace="${namespace}", persistentvolumeclaim="${name}"})))
    -
    sum without(instance, node) (topk(1, (kubelet_volume_stats_available_bytes{cluster="", job="kubelet", metrics_path="/metrics", namespace="${namespace}", persistentvolumeclaim="${name}"})))
  )
  `;
};

const getPrometheusPVCFreeSpaceQuery = ({ namespace, name }) => {
  return `sum without(instance, node) (topk(1, (kubelet_volume_stats_available_bytes{cluster="", job="kubelet", metrics_path="/metrics", namespace="${namespace}", persistentvolumeclaim="${name}"})))`;
};

const getPrometheusCPUQuery = (type, mode, data, step) => {
  if (type === 'cluster') {
    return `count(node_cpu_seconds_total{mode="idle"}) - sum(rate(node_cpu_seconds_total{mode="idle"}[${step}s]))`;
  } else if (type === 'pod' && mode === 'multiple') {
    return `sum by(container)(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{${getPrometheusSelector(
      data,
    )}, container != "POD"})`;
  } else if (type === 'pod' && mode === 'single') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{${getPrometheusSelector(
      data,
    )}})`;
  } else {
    return '';
  }
};

const getPrometheusMemoryQuery = (type, mode, data) => {
  if (type === 'cluster') {
    return `sum(node_memory_MemTotal_bytes - node_memory_MemFree_bytes)`;
  } else if (type === 'pod' && mode === 'multiple') {
    return `sum by(container)(node_namespace_pod_container:container_memory_working_set_bytes{${getPrometheusSelector(
      data,
    )}, container != "POD"})`;
  } else if (type === 'pod' && mode === 'single') {
    return `sum(node_namespace_pod_container:container_memory_working_set_bytes{${getPrometheusSelector(
      data,
    )}})`;
  } else {
    return '';
  }
};

const getPrometheusNetworkReceivedQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `sum(rate(node_network_receive_bytes_total{device!="lo"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(irate(container_network_receive_bytes_total{${getPrometheusSelector(
      data,
    )}}[${step}s]))`;
  } else {
    return '';
  }
};

const getPrometheusNetworkTransmittedQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `sum(rate(node_network_transmit_bytes_total{device!="lo"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(irate(container_network_transmit_bytes_total{${getPrometheusSelector(
      data,
    )}}[${step}s]))`;
  } else {
    return '';
  }
};

const getPrometheusNodesQuery = () => {
  return `sum(kubelet_node_name)`;
};

export function getMetric(type, mode, metric, { step, ...data }) {
  const metrics = {
    cpu: {
      prometheusQuery: getPrometheusCPUQuery(type, mode, data, step),
      unit: '',
    },
    memory: {
      prometheusQuery: getPrometheusMemoryQuery(type, mode, data),
      binary: true,
      unit: 'B',
    },
    'network-down': {
      prometheusQuery: getPrometheusNetworkReceivedQuery(type, data, step),
      unit: 'B/s',
    },
    'network-up': {
      prometheusQuery: getPrometheusNetworkTransmittedQuery(type, data, step),
      unit: 'B/s',
    },
    nodes: {
      prometheusQuery: getPrometheusNodesQuery(),
      unit: '',
    },
    'pvc-used-space': {
      prometheusQuery: getPrometheusPVCUsedSpaceQuery(data),
      binary: true,
      unit: 'B',
    },
    'pvc-free-space': {
      prometheusQuery: getPrometheusPVCFreeSpaceQuery(data),
      binary: true,
      unit: 'B',
    },
  };
  return metrics[metric];
}

export function usePrometheus({
  type,
  mode,
  metricId,
  defaultQuery,
  additionalProps: {
    items = 1,
    timeSpan = 60,
    skip = false,
    parseData = true,
    ...props
  },
}) {
  const step = timeSpan / items;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [query, setQuery] = useState(null);

  const kyma2_0path =
    'api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1';
  const kyma2_1path =
    'api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1';
  const [path, setPath] = useState(kyma2_1path);

  const metric =
    defaultQuery ||
    getMetric(type, mode, metricId, { step, ...props })?.prometheusQuery;

  useEffect(() => {
    const tick = () => {
      const newEndDate = new Date();
      const newStartDate = new Date();

      newEndDate.setTime(Date.now());
      newStartDate.setTime(newEndDate.getTime() - (timeSpan - 1) * 1000);
      setEndDate(newEndDate);
      setStartDate(newStartDate);

      setQuery(
        `query_range?` +
          `start=${newStartDate.toISOString()}&` +
          `end=${newEndDate.toISOString()}&` +
          `step=${step}&` +
          `query=${metric}`,
      );
    };

    tick();
    const loop = setInterval(tick, step * 1000);
    return () => clearInterval(loop);
  }, [timeSpan, items, metric]);

  const onDataReceived = data => {
    if (data?.error && data?.error?.statusCode === 'Failure') {
      if (path !== kyma2_0path && path !== kyma2_1path) {
        LuigiClient.sendCustomMessage({
          id: 'busola.setPrometheusPath',
          path: kyma2_1path,
        });
        setPath(kyma2_1path);
      } else if (path === kyma2_1path) {
        LuigiClient.sendCustomMessage({
          id: 'busola.setPrometheusPath',
          path: kyma2_0path,
        });
        setPath(kyma2_0path);
      }
    }
  };

  let { data, error, loading } = useGet(`/${path}/${query}`, {
    pollingInterval: 0,
    onDataReceived: data => onDataReceived(data),
    skip: !query || skip,
  });

  if (data) {
    error = null;
  }

  let prometheusData = [];
  let prometheusLabels = [];
  if (parseData === false) {
    (data?.data.result || []).forEach(d => {
      const result = {
        node: d?.metric?.node,
        value: d?.values?.[0]?.[1],
      };
      prometheusData.push(result);
    });
  } else {
    if (mode === 'multiple') {
      (data?.data.result || []).forEach(d => {
        let tempPrometheusData = [];

        let stepMultiplier = 0;
        let helpIndex = 0;
        const dataValues = d?.values;
        const metric = d?.metric;
        if (dataValues?.length > 0) {
          for (let i = 0; i < items; i++) {
            const [timestamp, graphValue] = dataValues[helpIndex] || [];
            const timeDifference = Math.floor(
              timestamp - startDate.getTime() / 1000,
            );
            if (stepMultiplier === timeDifference) {
              helpIndex++;
              tempPrometheusData.push(graphValue);
            } else {
              tempPrometheusData.push(null);
            }
            stepMultiplier += step;
          }
          prometheusLabels.push(`container="${metric.container}"`);
          prometheusData.push(tempPrometheusData);
        }
      });
    } else {
      const dataValues = data?.data.result[0]?.values;

      let stepMultiplier = 0;
      let helpIndex = 0;
      if (dataValues?.length > 0) {
        for (let i = 0; i < items; i++) {
          const [timestamp, graphValue] = dataValues[helpIndex] || [];
          const timeDifference = Math.floor(
            timestamp - startDate.getTime() / 1000,
          );
          if (stepMultiplier === timeDifference) {
            helpIndex++;
            prometheusData.push(graphValue);
          } else {
            prometheusData.push(null);
          }
          stepMultiplier += step;
        }
      }
    }
  }

  return {
    data: prometheusData,
    defaultLabels: prometheusLabels,
    error,
    loading,
    step,
    binary: metric?.binary,
    unit: metric?.unit,
    startDate,
    endDate,
  };
}
