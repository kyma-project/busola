import { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useFeature } from 'shared/hooks/useFeature';

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

const getPrometheusCPUQuery = (
  type,
  mode,
  data,
  step,
  cpuQuery = 'sum_irate',
) => {
  if (type === 'cluster') {
    return `count(node_cpu_seconds_total{mode="idle"}) - sum(rate(node_cpu_seconds_total{mode="idle"}[${step}s]))`;
  } else if (type === 'pod' && mode === 'multiple') {
    return `sum by(container)(node_namespace_pod_container:container_cpu_usage_seconds_total:${cpuQuery}{${getPrometheusSelector(
      data,
    )}, container != "POD"})`;
  } else if (type === 'pod' && mode === 'single') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:${cpuQuery}{${getPrometheusSelector(
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

export function getMetric(type, mode, metric, cpuQuery, { step, ...data }) {
  const metrics = {
    cpu: {
      prometheusQuery: getPrometheusCPUQuery(type, mode, data, step, cpuQuery),
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
  };
  return metrics[metric];
}

export function usePrometheus(
  type,
  mode,
  metricId,
  { items, timeSpan, ...props },
) {
  // const { serviceUrl } = useFeature('PROMETHEUS');
  useFeature('PROMETHEUS');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [step, setStep] = useState(timeSpan / items);

  const kyma2_0path =
    'api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1';
  const kyma2_1path =
    'api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1';
  const cpu2_0_partial_query = 'sum_rate';
  const cpu2_1_partial_query = 'sum_irate';
  const [path, setPath] = useState(kyma2_1path);
  const [cpuQuery, setCpuQuery] = useState(cpu2_1_partial_query);

  const metric = getMetric(type, mode, metricId, cpuQuery, { step, ...props });

  const tick = () => {
    const newEndDate = new Date();
    const newStartDate = new Date();

    newEndDate.setTime(Date.now());
    newStartDate.setTime(newEndDate.getTime() - (timeSpan - 1) * 1000);
    setEndDate(newEndDate);
    setStartDate(newStartDate);

    setStep(timeSpan / items);
  };

  useEffect(() => {
    tick();
    const loop = setInterval(tick, step * 1000);
    return () => clearInterval(loop);
  }, [metricId, timeSpan]); // eslint-disable-line react-hooks/exhaustive-deps

  const query =
    `query_range?` +
    `start=${startDate.toISOString()}&` +
    `end=${endDate.toISOString()}&` +
    `step=${step}&` +
    `query=${metric.prometheusQuery}`;

  const onDataReceived = data => {
    if (data?.error && data?.error?.statusCode === 'Failure') {
      if (path !== kyma2_0path && path !== kyma2_1path) {
        LuigiClient.sendCustomMessage({
          id: 'busola.setPrometheusPath',
          path: kyma2_1path,
        });
        setCpuQuery(cpu2_1_partial_query);
        setPath(kyma2_1path);
      } else if (path === kyma2_1path) {
        LuigiClient.sendCustomMessage({
          id: 'busola.setPrometheusPath',
          path: kyma2_0path,
        });
        setCpuQuery(cpu2_0_partial_query);
        setPath(kyma2_0path);
      }
    }
  };
  let { data, error, loading } = useGet(`/${path}/${query}`, {
    pollingInterval: 0,
    onDataReceived: data => onDataReceived(data),
  });

  if (data) {
    error = null;
  }

  let prometheusData = [];
  let prometheusLabels = [];

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

  return {
    data: prometheusData,
    defaultLabels: prometheusLabels,
    error,
    loading,
    step,
    binary: metric.binary,
    unit: metric.unit,
    startDate,
    endDate,
  };
}
