import { useEffect, useState } from 'react';
import { useGet } from 'react-shared';

export function prometheusSelector(type, data) {
  if (type === 'cluster') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{cluster=""})`;
  } else if (type === 'pod') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{cluster="", namespace="${data.namespace}", pod="${data.pod}"})`;
  } else {
    return '';
  }
}

export function getMetric(type, metric, { step, ...data }) {
  const selector = prometheusSelector(type, data);
  const metrics = {
    cpu: {
      prometheusQuery: selector,
      unit: '',
    },
    memory: {
      prometheusQuery: selector,
      binary: true,
      unit: 'B',
    },
    'network-down': {
      prometheusQuery: `sum(irate(container_network_receive_bytes_total{${selector}}[${step}s]))`,
      unit: 'B/s',
    },
    'network-up': {
      prometheusQuery: `sum(irate(container_network_transmit_bytes_total{${selector}}[${step}s]))`,
      unit: 'B/s',
    },
  };
  return metrics[metric];
}

export function usePrometheus(type, metricId, { items, timeSpan, ...props }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [step, setStep] = useState(timeSpan / items);

  const metric = getMetric(type, metricId, { step, ...props });

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

  const {
    data,
    error,
    loading,
  } = useGet(
    `/api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1/query_range?` +
      `start=${startDate.toISOString()}&` +
      `end=${endDate.toISOString()}&` +
      `step=${step}&` +
      `query=${metric.prometheusQuery}`,
    { pollingInterval: 0 },
  );

  let dataValues = data?.data.result[0]?.values.map(
    ([timestamp, value]) => value,
  );

  return {
    data: dataValues,
    error,
    loading,
    step,
    binary: metric.binary,
    unit: metric.unit,
    startDate,
    endDate,
  };
}
