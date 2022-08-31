const tcpKeepAlive = {
  path: 'tcpKeepalive',
  name: 'TCP Keep Alive',
  widget: 'FormGroup',
  children: [
    { path: 'probes', name: 'Probes' },
    { path: 'time', name: 'Time' },
    { path: 'interval', name: 'Interval' },
  ],
};

const tcp = {
  path: 'tcp',
  name: 'TCP',
  widget: 'FormGroup',
  children: [
    { path: 'maxConnections', name: 'Max Connections' },
    { path: 'connectTimeout', name: 'Connect Timeout' },
    tcpKeepAlive,
  ],
};

const http = {
  path: 'http',
  name: 'HTTP',
  widget: 'FormGroup',
  children: [
    { path: 'http1MaxPendingRequests', name: 'HTTP1 Max Pending Requests' },
    { path: 'http2MaxRequests', name: 'HTTP2 Max Requests' },
    { path: 'maxRequestsPerConnection', name: 'Max Requests Per Connection' },
    { path: 'maxRetries', name: 'Max Retries' },
    { path: 'idleTimeout', name: 'Idle Timeout' },
    { path: 'h2UpgradePolicy', name: 'H2 Upgrade Policy' },
    { path: 'useClientProtocol', name: 'Use Client Protocol' },
  ],
};

export const connectionPool = {
  path: 'connectionPool',
  name: 'Connection Pool',
  widget: 'FormGroup',
  children: [tcp, http],
};

const connectionPoolGenericListSyntax = { ...connectionPool };
connectionPoolGenericListSyntax.path = '[].connectionPool';
export { connectionPoolGenericListSyntax };
