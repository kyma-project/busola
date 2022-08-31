export const translations = {
  en: {
    'metadata.annotations': 'Annotations',
    'metadata.labels': 'Labels',
    'metadata.creationTimestamp': 'Created at',
    'resource.description':
      '{{[Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule)}} specifies rules that apply to traffic intended for a service after routing.',
    references: 'References',
    'spec.exportTo': 'Exported To Namespaces',
    'spec.host': 'Host',
    'spec.trafficPolicy': 'Traffic Policy dd',
    'spec.subsets': 'Subsets',
    'spec.workloadSelector': 'Workload Selector',
    'spec.trafficPolicy.connectionPool.tcp': 'TcP',
    probes: 'Probes',
    time: 'Time',
    interval: 'Interval',
    //
    //
    //
    //
    //common
    // connection pool
    'TCP Keep Alive': 'TCP Keep Alive',
    TCP: 'TCP',
    HTTP: 'HTTP',
    'HTTP1 Max Pending Requests': 'HTTP1 Max Pending Requests',
    'HTTP2 Max Requests': 'HTTP2 Max Requests',
    'Max Requests Per Connection': 'Max Requests Per Connection',
    'Connection Pool': 'Connection Pool',
    'Max Retries': 'Max Retries',
    'Idle Timeout': 'Idle Timeout',
    'H2 Upgrade Policy': 'H2 Upgrade Policy',
    'Use Client Protocol': 'Use Client Protocol',
    // load balancer
    'Locality LB Settings': 'Locality LB Settings',
    Enabled: 'Enabled',
    Distribute: 'Distribute',
    From: 'From',
    To: 'To',
    Failover: 'Failover',
    'Failover Priority': 'Failover Priority',
    httpCookie: 'HTTP Cookie',
    'Consistent Hash': 'Consistent Hash',
    'HTTP Header Name': 'HTTP Header Name',
    'Use Source IP': 'Use Source IP',
    'HTTP Query Parameter Name': 'HTTP Query Parameter Name',
    'Minimum Ring Size': 'Minimum Ring Size',
    'Load Balancer': 'Load Balancer',
    Simple: 'Simple',
    'Warmup Duration Secs': 'Warmup Duration Secs',
    // outlier detection
    'Split External Local Origin Errors': 'Split External Local Origin Errors',
    'Consecutive Local Origin Failures': 'Consecutive Local Origin Failures',
    'Consecutive Gateway Errors': 'Consecutive Gateway Errors',
    'Consecutive 5xx Errors': 'Consecutive 5xx Errors',
    Interval: 'Interval',
    'Base Ejection Time': 'Base Ejection Time',
    'Max Ejection Percent': 'Max Ejection Percent',
  },
};
