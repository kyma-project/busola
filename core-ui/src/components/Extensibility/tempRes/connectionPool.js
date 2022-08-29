export const connectionPool = prefix => ({
  source: prefix + 'connectionPool',
  name: 'connectionPool',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: prefix + 'connectionPool.tcp',
      name: 'connectionPool.tcp',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: prefix + 'connectionPool.tcp.maxConnections',
          name: 'maxConnections',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'connectionPool.tcp.connectTimeout',
          name: 'connectTimeout',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'connectionPool.tcp.tcpKeepalive',
          name: 'tcpKeepalive',
          visibility: '$exists($.data)',
          widget: 'Panel',
          children: [
            {
              source: prefix + 'connectionPool.tcp.tcpKeepalive.probes',
              name: 'tcpKeepalive.probes',
            },
            {
              source: prefix + 'connectionPool.tcp.tcpKeepalive.time',
              name: 'tcpKeepalive.time',
            },
            {
              source: prefix + 'connectionPool.tcp.tcpKeepalive.interval',
              name: 'tcpKeepalive.interval',
            },
          ],
        },
      ],
    },
    {
      source: prefix + 'connectionPool.http',
      name: 'connectionPool.http',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: prefix + 'connectionPool.http.http1MaxPendingRequests',
          name: 'http1MaxPendingRequests',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'connectionPool.http.http2MaxRequests',
          name: 'http2MaxRequests',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'connectionPool.http.maxRequestsPerConnection',
          name: 'maxRequestsPerConnection',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'connectionPool.http.maxRetries',
          name: 'maxRetries',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'connectionPool.http.idleTimeout',
          name: 'idleTimeout',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'connectionPool.http.h2UpgradePolicy',
          name: 'h2UpgradePolicy',
          visibility: '$exists($.data)',
          widget: 'Badge',
        },
        {
          source: prefix + 'connectionPool.http.useClientProtocol',
          name: 'useClientProtocol',
          visibility: '$exists($.data)',
          widget: 'Badge',
          highlights: {
            positive: ['true'],
            negative: ['false'],
          },
        },
      ],
    },
  ],
});
