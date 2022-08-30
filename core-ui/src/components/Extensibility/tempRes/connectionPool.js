export const connectionPool = prefix => ({
  source: prefix + 'connectionPool',
  name: 'connectionPool',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.tcp',
      name: 'connectionPool.tcp',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: '$parent.maxConnections',
          name: 'maxConnections',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.connectTimeout',
          name: 'connectTimeout',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.tcpKeepalive',
          name: 'tcpKeepalive',
          visibility: '$exists($.data)',
          widget: 'Panel',
          children: [
            {
              source: '$parent.probes',
              name: 'tcpKeepalive.probes',
            },
            {
              source: '$parent.time',
              name: 'tcpKeepalive.time',
            },
            {
              source: '$parent.interval',
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
