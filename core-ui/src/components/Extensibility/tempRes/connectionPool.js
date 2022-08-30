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
      source: '$parent.http',
      name: 'connectionPool.http',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: '$parent.http1MaxPendingRequests',
          name: 'http1MaxPendingRequests',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.http2MaxRequests',
          name: 'http2MaxRequests',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.maxRequestsPerConnection',
          name: 'maxRequestsPerConnection',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.maxRetries',
          name: 'maxRetries',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.idleTimeout',
          name: 'idleTimeout',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.h2UpgradePolicy',
          name: 'h2UpgradePolicy',
          visibility: '$exists($.data)',
          widget: 'Badge',
        },
        {
          source: '$parent.useClientProtocol',
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
