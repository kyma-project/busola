const tcpKeepAlive = {
  path: 'tcpKeepalive',
  widget: 'FormGroup',
  children: [{ path: 'probes' }, { path: 'time' }, { path: 'interval' }],
};

const tcp = {
  path: 'tcp',
  widget: 'FormGroup',
  children: [
    { path: 'maxConnections' },
    { path: 'connectTimeout' },
    tcpKeepAlive,
  ],
};

const http = {
  path: 'http',
  widget: 'FormGroup',
  children: [
    { path: 'http1MaxPendingRequests' },
    { path: 'http2MaxRequests' },
    { path: 'maxRequestsPerConnection' },
    { path: 'maxRetries' },
    { path: 'idleTimeout' },
    { path: 'h2UpgradePolicy' },
    { path: 'useClientProtocol' },
  ],
};

export const connectionPool = {
  path: 'connectionPool',
  widget: 'FormGroup',
  children: [tcp, http],
};
