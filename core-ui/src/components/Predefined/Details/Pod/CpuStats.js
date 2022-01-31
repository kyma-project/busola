import React, { useState, useEffect, useRef } from 'react';
import { LayoutPanel } from 'fundamental-react';
import { useGet } from 'react-shared';

export function CpuStats(resource) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [step] = useState(5);
  const canvas = useRef();

  const {
    data,
    error,
    loading,
    // } = useGet(`/api/v1/namespaces/${otherParams.namespace}/services/echo-server/proxy`);
  } = useGet(
    `/api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1/query_range?` +
      `start=${startDate.toISOString()}&` +
      `end=${endDate.toISOString()}&` +
      `step=${step}&` +
      // `query=node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{namespace="${otherParams.namespace}", pod="${otherParams.resourceName}", container="istio-proxy"}`,
      `query=node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{` +
      `namespace="${resource.metadata.namespace}",` +
      `pod="${resource.metadata.name}"` +
      `}`,
    { pollingInterval: 0 },
  );
  // start: '1643285741.626',
  // end: '1643289341.626',
  // step: 14,
  // });

  useEffect(() => {
    startDate.setTime(endDate.getTime() - 5 * 60 * 1000);
    setStartDate(startDate);

    const loop = setInterval(() => {
      const now = new Date();
      setEndDate(now);
      startDate.setTime(now.getTime() - 5 * 60 * 1000);
      setStartDate(startDate);
    }, step * 1000);
    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    // TODO draw
    if (!canvas.current) return;
    if (!data) return;

    var ctx = canvas.current.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 300, 100);

    // ctx.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx.strokeStyle = '#666';
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 10);
      ctx.lineTo(300, i * 10);
      ctx.stroke();
    }

    ctx.fillStyle = '#00f';
    data.data.result[0].values.forEach((entry, index) => {
      const [timestamp, value] = entry;
      ctx.fillRect(5 * index, 100, 4, -Math.max(100 * value, 1));
    });

    // ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    // ctx.fillRect(30, 30, 50, 50);
  }, [canvas, data]);

  // useEffect(() => {
  // // const url=`https://api.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy`;
  // // const url=`http://<kubernetes_master_address>/api/v1/namespaces/<namespace_name>/services/<service_name>/proxy`;
  // // https://dashboard.dev.kyma.cloud.sap/backend/api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1/query?query=node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{namespace="kyma-system", pod="monitoring-grafana-f845ff56b-wgkfb", container="grafana"}&start=1643285741.626&end=1643289341.626&step=14
  // // const url=`http://api.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com/api/v1/namespaces/${otherParams.namespace}/services/monitoring-prometheus:web/proxy/api/v1/query?query=node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{namespace="kyma-system", pod="monitoring-grafana-f845ff56b-wgkfb", container="grafana"}&start=1643285741.626&end=1643289341.626&step=14`;
  // const url=`http://localhost:3001/backend/api/v1/namespaces/${otherParams.namespace}/services/monitoring-prometheus:web/proxy/api/v1/query?query=node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{namespace="kyma-system", pod="monitoring-grafana-f845ff56b-wgkfb", container="grafana"}&start=1643285741.626&end=1643289341.626&step=14`;
  // fetch(url)
  // .then(result => console.log('prometheus?', result));

  // }, []);

  return (
    <LayoutPanel className="fd-margin--md container-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="CPU usage" />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <canvas
          ref={canvas}
          style={{ width: '100%' }}
          width="300"
          height="100"
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
