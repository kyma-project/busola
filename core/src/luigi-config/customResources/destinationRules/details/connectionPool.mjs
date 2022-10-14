export const connectionPool = prefix => ({
  source: `${prefix}connectionPool`,
  name: 'Connection Pool',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.tcp',
      name: 'TCP',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: '$parent.maxConnections',
          name: 'Max Connections',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.connectTimeout',
          name: 'Connect Timeout',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.tcpKeepalive',
          name: 'TCP Keep Alive',
          visibility: '$exists($.data)',
          widget: 'Panel',
          children: [
            {
              source: '$parent.probes',
              name: 'Probes',
            },
            {
              source: '$parent.time',
              name: 'Time',
            },
            {
              source: '$parent.interval',
              name: 'Interval',
            },
          ],
        },
      ],
    },
    {
      source: '$parent.http',
      name: 'HTTP',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: '$parent.http1MaxPendingRequests',
          name: 'HTTP1 Max Pending Requests',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.http2MaxRequests',
          name: 'HTTP2 Max Requests',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.maxRequestsPerConnection',
          name: 'Max Requests Per Connection',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.maxRetries',
          name: 'Max Retries',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.idleTimeout',
          name: 'Idle Timeout',
          visibility: '$exists($.data)',
        },
        {
          source: '$parent.h2UpgradePolicy',
          name: 'H2 Upgrade Policy',
          visibility: '$exists($.data)',
          widget: 'Badge',
        },
        {
          source: '$parent.useClientProtocol',
          name: 'Use Client Protocol',
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
