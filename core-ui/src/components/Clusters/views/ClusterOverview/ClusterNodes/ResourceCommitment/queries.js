import { useGet } from 'shared/hooks/BackendAPI/useGet';

function usePrometheusQuery(serviceUrl, query, time) {
  query = encodeURIComponent(query);
  const url = `${serviceUrl}/query?query=${query}&time=${time}`;
  const { data, loading, error } = useGet(url, {
    pollingInterval: 0,
    skip: !serviceUrl,
  });

  // eslint-disable-next-line no-unused-vars
  const [_date, value] = data?.data?.result[0]?.value || [];
  return { value: parseFloat(value) || null, loading, error };
}

export function useCurrentQuery({ serviceUrl, time, queryType }) {
  const flattenRequests = requests => {
    return {
      data: Object.fromEntries(
        requests.map(request => [request.name, request.query.value]),
      ),
      loading: requests.some(request => request.query.loading), // any loading=true
      error: requests.find(request => request.query.error)?.query?.error, // find first error
    };
  };

  const queries = {
    cpu: {
      utilized:
        '1 - sum(avg by (mode) (rate(node_cpu_seconds_total{ mode=~"idle|iowait|steal", }[150s])))',
      limits:
        'sum(namespace_cpu:kube_pod_container_resource_limits:sum{}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu"})',
      requests:
        'sum(namespace_cpu:kube_pod_container_resource_requests:sum{}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="cpu"})',
    },
    memory: {
      utilized:
        '1 - sum(:node_memory_MemAvailable_bytes:sum{}) / sum(node_memory_MemTotal_bytes{})',
      limits:
        'sum(namespace_memory:kube_pod_container_resource_limits:sum{}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory"})',
      requests:
        'sum(namespace_memory:kube_pod_container_resource_requests:sum{}) / sum(kube_node_status_allocatable{job="kube-state-metrics",resource="memory"})',
    },
  }[queryType];

  return flattenRequests([
    {
      name: 'utilized',
      query: usePrometheusQuery(serviceUrl, queries.utilized, time),
    },
    {
      name: 'limits',
      query: usePrometheusQuery(serviceUrl, queries.limits, time),
    },
    {
      name: 'requests',
      query: usePrometheusQuery(serviceUrl, queries.requests, time),
    },
  ]);
}
