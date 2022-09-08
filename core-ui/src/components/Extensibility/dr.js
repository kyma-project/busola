export const destinationRules = {
  general: {
    resource: {
      kind: 'DestinationRule',
      group: 'networking.istio.io',
      version: 'v1beta1',
    },
    name: 'Destination Rules',
    category: 'Istio',
    urlPath: 'destinationrules',
    scope: 'namespace',
    description: 'resource.description',
  },
  details: {
    header: [],
    body: [
      {
        name: 'References',
        widget: 'Panel',
        children: [
          {
            source: 'spec.host',
            name: 'Host',
          },
          {
            source: 'spec.exportTo',
            widget: 'Labels',
            name: 'Export To',
            visibility: '$count(data)',
          },
          {
            source: 'spec.workloadSelector.matchLabels',
            widget: 'Labels',
            name: 'Match Labels of Workload Selector ',
            visibility: '$count(data)',
          },
        ],
      },
      {
        source: 'spec.trafficPolicy',
        name: 'Traffic Policy',
        visibility: '$exists($.data)',
        widget: 'Panel',
        children: [
          {
            source: '$parent.loadBalancer',
            name: 'Load Balancer',
            visibility: '$exists($.data)',
            widget: 'Panel',
            children: [
              {
                source: '$parent.simple',
                name: 'Simple',
                visibility: '$exists($.data)',
                widget: 'Badge',
              },
              {
                source: '$parent.warmupDurationSecs',
                name: 'Warmup Duration Secs',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.consistentHash',
                name: 'Consistent Hash',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.httpHeaderName',
                    name: 'HTTP Header Name',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.useSourceIp',
                    name: 'Use Source IP',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                    highlights: {
                      positive: ['true'],
                      negative: ['false'],
                    },
                  },
                  {
                    source: '$parent.httpQueryParameterName',
                    name: 'HTTP Query Parameter Name',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.minimumRingSize',
                    name: 'Minimum Ring Size',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.httpCookie',
                    name: 'HTTP Cookie',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        source: '$parent.name',
                        name: 'Name',
                      },
                      {
                        source: '$parent.path',
                        name: 'Path',
                      },
                      {
                        source: '$parent.ttl',
                        name: 'TTL',
                      },
                    ],
                  },
                ],
              },
              {
                source: '$parent.localityLbSetting',
                name: 'Locality LB Settings',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    name: 'Enabled',
                    source: '$parent.enabled',
                    widget: 'Badge',
                    highlights: {
                      positive: ['true'],
                      negative: ['false'],
                    },
                  },
                  {
                    widget: 'Table',
                    name: 'Distribute',
                    visibility: '$count(data)',
                    source: '$parent.distribute',
                    children: [
                      {
                        source: '$item.from',
                        name: 'From',
                      },
                      {
                        source: '$item.to',
                        name: 'To',
                        widget: 'Labels',
                      },
                    ],
                  },
                  {
                    widget: 'Table',
                    name: 'Failover',
                    visibility: '$count(data)',
                    source: '$parent.failover',
                    children: [
                      {
                        source: '$item.from',
                        name: 'From',
                      },
                      {
                        source: '$item.to',
                        name: 'To',
                      },
                    ],
                  },
                  {
                    name: 'Failover Priority',
                    source: '$parent.failoverPriority',
                    widget: 'JoinedArray',
                    visibility: '$count(data)',
                  },
                ],
              },
            ],
          },
          {
            source: '$parent.connectionPool',
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
          },
          {
            source: '$parent.outlierDetection',
            name: 'outlierDetection',
            visibility: '$exists($.data)',
            widget: 'Panel',
            children: [
              {
                source: '$parent.splitExternalLocalOriginErrors',
                name: 'Split External Local Origin Errors',
                visibility: '$exists($.data)',
                widget: 'Badge',
                highlights: {
                  positive: ['true'],
                  negative: ['false'],
                },
              },
              {
                source: '$parent.consecutiveLocalOriginFailures',
                name: 'Consecutive Local Origin Failures',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.consecutiveGatewayErrors',
                name: 'Consecutive Gateway Errors',
                visibility: '$exists($.data)',
                type: 'number',
              },
              {
                source: '$parent.consecutive5xxErrors',
                name: 'Consecutive 5xx Errors',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.interval',
                name: 'Interval',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.baseEjectionTime',
                name: 'Base Ejection Time',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.maxEjectionPercent',
                name: 'Max Ejection Percent',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.minHealthPercent',
                name: 'Min Health Percent',
                visibility: '$exists($.data)',
              },
            ],
          },
          {
            source: '$parent.tls',
            name: 'TLS',
            visibility: '$exists($.data)',
            widget: 'Panel',
            children: [
              {
                source: '$parent.mode',
                name: 'Mode',
                visibility: '$exists($.data)',
                widget: 'Badge',
              },
              {
                source: '$parent.clientCertificate',
                name: 'Client Certificate',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.privateKey',
                name: 'Private Key',
                visibility: '$exists($.data)',
                type: 'number',
              },
              {
                source: '$parent.caCertificates',
                name: 'CA Certificates',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.credentialName',
                name: 'Credential Name',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.subjectAltNames',
                name: 'Subject Alt Names',
                visibility: '$exists($.data)',
                widget: 'Labels',
              },
              {
                source: '$parent.sni',
                name: 'SNI',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.insecureSkipVerify',
                name: 'Insecure Skip Verify',
                visibility: '$exists($.data)',
                widget: 'Badge',
              },
            ],
          },
          {
            source: '$parent.portLevelSettings',
            name: 'portLevelSettings',
            widget: 'Table',
            children: [
              {
                source: '$item.port.number',
                name: 'port',
              },
            ],
            visibility: '$count(data)',
            collapsible: [
              {
                source: '$item.loadBalancer',
                name: 'Load Balancer',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.simple',
                    name: 'Simple',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                  {
                    source: '$parent.warmupDurationSecs',
                    name: 'Warmup Duration Secs',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.consistentHash',
                    name: 'Consistent Hash',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        source: '$parent.httpHeaderName',
                        name: 'HTTP Header Name',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.useSourceIp',
                        name: 'Use Source IP',
                        visibility: '$exists($.data)',
                        widget: 'Badge',
                        highlights: {
                          positive: ['true'],
                          negative: ['false'],
                        },
                      },
                      {
                        source: '$parent.httpQueryParameterName',
                        name: 'HTTP Query Parameter Name',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.minimumRingSize',
                        name: 'Minimum Ring Size',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.httpCookie',
                        name: 'HTTP Cookie',
                        visibility: '$exists($.data)',
                        widget: 'Panel',
                        children: [
                          {
                            source: '$parent.name',
                            name: 'Name',
                          },
                          {
                            source: '$parent.path',
                            name: 'Path',
                          },
                          {
                            source: '$parent.ttl',
                            name: 'TTL',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    source: '$parent.localityLbSetting',
                    name: 'Locality LB Settings',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        name: 'Enabled',
                        source: '$parent.enabled',
                        widget: 'Badge',
                        highlights: {
                          positive: ['true'],
                          negative: ['false'],
                        },
                      },
                      {
                        widget: 'Table',
                        name: 'Distribute',
                        visibility: '$count(data)',
                        source: '$parent.distribute',
                        children: [
                          {
                            source: '$item.from',
                            name: 'From',
                          },
                          {
                            source: '$item.to',
                            name: 'To',
                            widget: 'Labels',
                          },
                        ],
                      },
                      {
                        widget: 'Table',
                        name: 'Failover',
                        visibility: '$count(data)',
                        source: '$parent.failover',
                        children: [
                          {
                            source: '$item.from',
                            name: 'From',
                          },
                          {
                            source: '$item.to',
                            name: 'To',
                          },
                        ],
                      },
                      {
                        name: 'Failover Priority',
                        source: '$parent.failoverPriority',
                        widget: 'JoinedArray',
                        visibility: '$count(data)',
                      },
                    ],
                  },
                ],
              },
              {
                source: '$item.connectionPool',
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
              },
              {
                source: '$item.outlierDetection',
                name: 'outlierDetection',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.splitExternalLocalOriginErrors',
                    name: 'Split External Local Origin Errors',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                    highlights: {
                      positive: ['true'],
                      negative: ['false'],
                    },
                  },
                  {
                    source: '$parent.consecutiveLocalOriginFailures',
                    name: 'Consecutive Local Origin Failures',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.consecutiveGatewayErrors',
                    name: 'Consecutive Gateway Errors',
                    visibility: '$exists($.data)',
                    type: 'number',
                  },
                  {
                    source: '$parent.consecutive5xxErrors',
                    name: 'Consecutive 5xx Errors',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.interval',
                    name: 'Interval',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.baseEjectionTime',
                    name: 'Base Ejection Time',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.maxEjectionPercent',
                    name: 'Max Ejection Percent',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.minHealthPercent',
                    name: 'Min Health Percent',
                    visibility: '$exists($.data)',
                  },
                ],
              },
              {
                source: '$item.tls',
                name: 'TLS',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.mode',
                    name: 'Mode',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                  {
                    source: '$parent.clientCertificate',
                    name: 'Client Certificate',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.privateKey',
                    name: 'Private Key',
                    visibility: '$exists($.data)',
                    type: 'number',
                  },
                  {
                    source: '$parent.caCertificates',
                    name: 'CA Certificates',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.credentialName',
                    name: 'Credential Name',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.subjectAltNames',
                    name: 'Subject Alt Names',
                    visibility: '$exists($.data)',
                    widget: 'Labels',
                  },
                  {
                    source: '$parent.sni',
                    name: 'SNI',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.insecureSkipVerify',
                    name: 'Insecure Skip Verify',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                ],
              },
              {
                source: '$item.tunnel',
                name: 'Tunnel',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.protocol',
                    name: 'Protocol',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                  {
                    source: '$parent.targetHost',
                    name: 'Target Host',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.targetPort',
                    name: 'Target Port',
                    visibility: '$exists($.data)',
                  },
                ],
              },
            ],
          },
          {
            source: '$parent.tunnel',
            name: 'Tunnel',
            visibility: '$exists($.data)',
            widget: 'Panel',
            children: [
              {
                source: '$parent.protocol',
                name: 'Protocol',
                visibility: '$exists($.data)',
                widget: 'Badge',
              },
              {
                source: '$parent.targetHost',
                name: 'Target Host',
                visibility: '$exists($.data)',
              },
              {
                source: '$parent.targetPort',
                name: 'Target Port',
                visibility: '$exists($.data)',
              },
            ],
          },
        ],
      },
      {
        source: 'spec.subsets',
        name: 'Subsets',
        widget: 'Table',
        visibility: '$count(data)',
        children: [
          {
            source: '$item.name',
            name: 'Name',
          },
          {
            source: '$item.labels',
            name: 'Labels',
            widget: 'Labels',
          },
        ],
        collapsible: [
          {
            source: '$item.trafficPolicy',
            name: 'Traffic Policy',
            visibility: '$exists($.data)',
            widget: 'Panel',
            children: [
              {
                source: '$parent.loadBalancer',
                name: 'Load Balancer',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.simple',
                    name: 'Simple',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                  {
                    source: '$parent.warmupDurationSecs',
                    name: 'Warmup Duration Secs',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.consistentHash',
                    name: 'Consistent Hash',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        source: '$parent.httpHeaderName',
                        name: 'HTTP Header Name',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.useSourceIp',
                        name: 'Use Source IP',
                        visibility: '$exists($.data)',
                        widget: 'Badge',
                        highlights: {
                          positive: ['true'],
                          negative: ['false'],
                        },
                      },
                      {
                        source: '$parent.httpQueryParameterName',
                        name: 'HTTP Query Parameter Name',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.minimumRingSize',
                        name: 'Minimum Ring Size',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.httpCookie',
                        name: 'HTTP Cookie',
                        visibility: '$exists($.data)',
                        widget: 'Panel',
                        children: [
                          {
                            source: '$parent.name',
                            name: 'Name',
                          },
                          {
                            source: '$parent.path',
                            name: 'Path',
                          },
                          {
                            source: '$parent.ttl',
                            name: 'TTL',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    source: '$parent.localityLbSetting',
                    name: 'Locality LB Settings',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        name: 'Enabled',
                        source: '$parent.enabled',
                        widget: 'Badge',
                        highlights: {
                          positive: ['true'],
                          negative: ['false'],
                        },
                      },
                      {
                        widget: 'Table',
                        name: 'Distribute',
                        visibility: '$count(data)',
                        source: '$parent.distribute',
                        children: [
                          {
                            source: '$item.from',
                            name: 'From',
                          },
                          {
                            source: '$item.to',
                            name: 'To',
                            widget: 'Labels',
                          },
                        ],
                      },
                      {
                        widget: 'Table',
                        name: 'Failover',
                        visibility: '$count(data)',
                        source: '$parent.failover',
                        children: [
                          {
                            source: '$item.from',
                            name: 'From',
                          },
                          {
                            source: '$item.to',
                            name: 'To',
                          },
                        ],
                      },
                      {
                        name: 'Failover Priority',
                        source: '$parent.failoverPriority',
                        widget: 'JoinedArray',
                        visibility: '$count(data)',
                      },
                    ],
                  },
                ],
              },
              {
                source: '$parent.connectionPool',
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
              },
              {
                source: '$parent.outlierDetection',
                name: 'outlierDetection',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.splitExternalLocalOriginErrors',
                    name: 'Split External Local Origin Errors',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                    highlights: {
                      positive: ['true'],
                      negative: ['false'],
                    },
                  },
                  {
                    source: '$parent.consecutiveLocalOriginFailures',
                    name: 'Consecutive Local Origin Failures',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.consecutiveGatewayErrors',
                    name: 'Consecutive Gateway Errors',
                    visibility: '$exists($.data)',
                    type: 'number',
                  },
                  {
                    source: '$parent.consecutive5xxErrors',
                    name: 'Consecutive 5xx Errors',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.interval',
                    name: 'Interval',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.baseEjectionTime',
                    name: 'Base Ejection Time',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.maxEjectionPercent',
                    name: 'Max Ejection Percent',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.minHealthPercent',
                    name: 'Min Health Percent',
                    visibility: '$exists($.data)',
                  },
                ],
              },
              {
                source: '$parent.tls',
                name: 'TLS',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.mode',
                    name: 'Mode',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                  {
                    source: '$parent.clientCertificate',
                    name: 'Client Certificate',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.privateKey',
                    name: 'Private Key',
                    visibility: '$exists($.data)',
                    type: 'number',
                  },
                  {
                    source: '$parent.caCertificates',
                    name: 'CA Certificates',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.credentialName',
                    name: 'Credential Name',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.subjectAltNames',
                    name: 'Subject Alt Names',
                    visibility: '$exists($.data)',
                    widget: 'Labels',
                  },
                  {
                    source: '$parent.sni',
                    name: 'SNI',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.insecureSkipVerify',
                    name: 'Insecure Skip Verify',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                ],
              },
              {
                source: '$parent.portLevelSettings',
                name: 'portLevelSettings',
                widget: 'Table',
                children: [
                  {
                    source: '$item.port.number',
                    name: 'port',
                  },
                ],
                visibility: '$count(data)',
                collapsible: [
                  {
                    source: '$item.loadBalancer',
                    name: 'Load Balancer',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        source: '$parent.simple',
                        name: 'Simple',
                        visibility: '$exists($.data)',
                        widget: 'Badge',
                      },
                      {
                        source: '$parent.warmupDurationSecs',
                        name: 'Warmup Duration Secs',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.consistentHash',
                        name: 'Consistent Hash',
                        visibility: '$exists($.data)',
                        widget: 'Panel',
                        children: [
                          {
                            source: '$parent.httpHeaderName',
                            name: 'HTTP Header Name',
                            visibility: '$exists($.data)',
                          },
                          {
                            source: '$parent.useSourceIp',
                            name: 'Use Source IP',
                            visibility: '$exists($.data)',
                            widget: 'Badge',
                            highlights: {
                              positive: ['true'],
                              negative: ['false'],
                            },
                          },
                          {
                            source: '$parent.httpQueryParameterName',
                            name: 'HTTP Query Parameter Name',
                            visibility: '$exists($.data)',
                          },
                          {
                            source: '$parent.minimumRingSize',
                            name: 'Minimum Ring Size',
                            visibility: '$exists($.data)',
                          },
                          {
                            source: '$parent.httpCookie',
                            name: 'HTTP Cookie',
                            visibility: '$exists($.data)',
                            widget: 'Panel',
                            children: [
                              {
                                source: '$parent.name',
                                name: 'Name',
                              },
                              {
                                source: '$parent.path',
                                name: 'Path',
                              },
                              {
                                source: '$parent.ttl',
                                name: 'TTL',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        source: '$parent.localityLbSetting',
                        name: 'Locality LB Settings',
                        visibility: '$exists($.data)',
                        widget: 'Panel',
                        children: [
                          {
                            name: 'Enabled',
                            source: '$parent.enabled',
                            widget: 'Badge',
                            highlights: {
                              positive: ['true'],
                              negative: ['false'],
                            },
                          },
                          {
                            widget: 'Table',
                            name: 'Distribute',
                            visibility: '$count(data)',
                            source: '$parent.distribute',
                            children: [
                              {
                                source: '$item.from',
                                name: 'From',
                              },
                              {
                                source: '$item.to',
                                name: 'To',
                                widget: 'Labels',
                              },
                            ],
                          },
                          {
                            widget: 'Table',
                            name: 'Failover',
                            visibility: '$count(data)',
                            source: '$parent.failover',
                            children: [
                              {
                                source: '$item.from',
                                name: 'From',
                              },
                              {
                                source: '$item.to',
                                name: 'To',
                              },
                            ],
                          },
                          {
                            name: 'Failover Priority',
                            source: '$parent.failoverPriority',
                            widget: 'JoinedArray',
                            visibility: '$count(data)',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    source: '$item.connectionPool',
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
                  },
                  {
                    source: '$item.outlierDetection',
                    name: 'outlierDetection',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        source: '$parent.splitExternalLocalOriginErrors',
                        name: 'Split External Local Origin Errors',
                        visibility: '$exists($.data)',
                        widget: 'Badge',
                        highlights: {
                          positive: ['true'],
                          negative: ['false'],
                        },
                      },
                      {
                        source: '$parent.consecutiveLocalOriginFailures',
                        name: 'Consecutive Local Origin Failures',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.consecutiveGatewayErrors',
                        name: 'Consecutive Gateway Errors',
                        visibility: '$exists($.data)',
                        type: 'number',
                      },
                      {
                        source: '$parent.consecutive5xxErrors',
                        name: 'Consecutive 5xx Errors',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.interval',
                        name: 'Interval',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.baseEjectionTime',
                        name: 'Base Ejection Time',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.maxEjectionPercent',
                        name: 'Max Ejection Percent',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.minHealthPercent',
                        name: 'Min Health Percent',
                        visibility: '$exists($.data)',
                      },
                    ],
                  },
                  {
                    source: '$item.tls',
                    name: 'TLS',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        source: '$parent.mode',
                        name: 'Mode',
                        visibility: '$exists($.data)',
                        widget: 'Badge',
                      },
                      {
                        source: '$parent.clientCertificate',
                        name: 'Client Certificate',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.privateKey',
                        name: 'Private Key',
                        visibility: '$exists($.data)',
                        type: 'number',
                      },
                      {
                        source: '$parent.caCertificates',
                        name: 'CA Certificates',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.credentialName',
                        name: 'Credential Name',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.subjectAltNames',
                        name: 'Subject Alt Names',
                        visibility: '$exists($.data)',
                        widget: 'Labels',
                      },
                      {
                        source: '$parent.sni',
                        name: 'SNI',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.insecureSkipVerify',
                        name: 'Insecure Skip Verify',
                        visibility: '$exists($.data)',
                        widget: 'Badge',
                      },
                    ],
                  },
                  {
                    source: '$item.tunnel',
                    name: 'Tunnel',
                    visibility: '$exists($.data)',
                    widget: 'Panel',
                    children: [
                      {
                        source: '$parent.protocol',
                        name: 'Protocol',
                        visibility: '$exists($.data)',
                        widget: 'Badge',
                      },
                      {
                        source: '$parent.targetHost',
                        name: 'Target Host',
                        visibility: '$exists($.data)',
                      },
                      {
                        source: '$parent.targetPort',
                        name: 'Target Port',
                        visibility: '$exists($.data)',
                      },
                    ],
                  },
                ],
              },
              {
                source: '$parent.tunnel',
                name: 'Tunnel',
                visibility: '$exists($.data)',
                widget: 'Panel',
                children: [
                  {
                    source: '$parent.protocol',
                    name: 'Protocol',
                    visibility: '$exists($.data)',
                    widget: 'Badge',
                  },
                  {
                    source: '$parent.targetHost',
                    name: 'Target Host',
                    visibility: '$exists($.data)',
                  },
                  {
                    source: '$parent.targetPort',
                    name: 'Target Port',
                    visibility: '$exists($.data)',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  form: [
    {
      simple: true,
      path: 'spec.host',
      name: 'Host',
    },
    {
      widget: 'FormGroup',
      path: 'spec.trafficPolicy',
      name: 'Traffic Policy',
      children: [
        {
          widget: 'FormGroup',
          path: 'loadBalancer',
          name: 'Load Balancer',
          children: [
            {
              var: 'loadBalancerSelector',
              name: 'chooseLoadBalancerSelector',
              type: 'string',
              enum: ['simple', 'consistentHash'],
            },
            {
              path: 'simple',
              name: 'Simple',
              visibility: "$loadBalancerSelector = 'simple'",
            },
            {
              widget: 'FormGroup',
              path: 'consistentHash',
              name: 'Consistent Hash',
              visibility: "$loadBalancerSelector = 'consistentHash'",
              children: [
                {
                  var: 'consistentHashSelector',
                  name: 'chooseConsistentHashSelector',
                  type: 'string',
                  enum: [
                    'httpHeaderName',
                    'httpCookie',
                    'useSourceIp',
                    'httpQueryParameterName',
                  ],
                },
                {
                  path: 'httpHeaderName',
                  name: 'HTTP Header Name',
                  visibility: "$consistentHashSelector = 'httpHeaderName'",
                },
                {
                  path: 'httpCookie',
                  name: 'HTTP Cookie',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'name',
                      name: 'Name',
                    },
                    {
                      path: 'path',
                      name: 'Path',
                    },
                    {
                      path: 'ttl',
                      name: 'TTL',
                    },
                  ],
                },
                {
                  path: 'useSourceIp',
                  name: 'Use Source IP',
                  visibility: "$consistentHashSelector = 'useSourceIp'",
                },
                {
                  path: 'httpQueryParameterName',
                  name: 'HTTP Query Parameter Name',
                  visibility:
                    "$consistentHashSelector = 'httpQueryParameterName'",
                },
                {
                  path: 'minimumRingSize',
                  name: 'Minimum Ring Size',
                },
              ],
            },
            {
              path: 'localityLbSetting',
              name: 'Locality LB Settings',
              widget: 'FormGroup',
              children: [
                {
                  path: 'enabled',
                  name: 'Enabled',
                  type: 'boolean',
                },
                {
                  path: 'distribute',
                  name: 'Distribute',
                  widget: 'GenericList',
                },
                {
                  path: 'distribute[].from',
                  name: 'From',
                },
                {
                  path: 'distribute[].to',
                  name: 'To',
                  widget: 'KeyValuePair',
                  valueType: 'number',
                },
                {
                  path: 'failover',
                  name: 'Failover',
                  widget: 'GenericList',
                },
                {
                  path: 'failover[].from',
                  name: 'From',
                },
                {
                  path: 'failover[].to',
                  name: 'To',
                },
                {
                  path: 'failoverPriority',
                  name: 'Failover Priority',
                  widget: 'SimpleList',
                },
              ],
            },
            {
              path: 'warmupDurationSecs',
              name: 'Warmup Duration Secs',
            },
          ],
        },
        {
          path: 'connectionPool',
          name: 'Connection Pool',
          widget: 'FormGroup',
          children: [
            {
              path: 'tcp',
              name: 'TCP',
              widget: 'FormGroup',
              children: [
                {
                  path: 'maxConnections',
                  name: 'Max Connections',
                },
                {
                  path: 'connectTimeout',
                  name: 'Connect Timeout',
                },
                {
                  path: 'tcpKeepalive',
                  name: 'TCP Keep Alive',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'probes',
                      name: 'Probes',
                    },
                    {
                      path: 'time',
                      name: 'Time',
                    },
                    {
                      path: 'interval',
                      name: 'Interval',
                    },
                  ],
                },
              ],
            },
            {
              path: 'http',
              name: 'HTTP',
              widget: 'FormGroup',
              children: [
                {
                  path: 'http1MaxPendingRequests',
                  name: 'HTTP1 Max Pending Requests',
                },
                {
                  path: 'http2MaxRequests',
                  name: 'HTTP2 Max Requests',
                },
                {
                  path: 'maxRequestsPerConnection',
                  name: 'Max Requests Per Connection',
                },
                {
                  path: 'maxRetries',
                  name: 'Max Retries',
                },
                {
                  path: 'idleTimeout',
                  name: 'Idle Timeout',
                },
                {
                  path: 'h2UpgradePolicy',
                  name: 'H2 Upgrade Policy',
                },
                {
                  path: 'useClientProtocol',
                  name: 'Use Client Protocol',
                },
              ],
            },
          ],
        },
        {
          path: 'outlierDetection',
          widget: 'FormGroup',
          children: [
            {
              path: 'splitExternalLocalOriginErrors',
              name: 'Split External Local Origin Errors',
            },
            {
              path: 'consecutiveLocalOriginFailures',
              name: 'Consecutive Local Origin Failures',
              type: 'number',
            },
            {
              path: 'consecutiveGatewayErrors',
              name: 'Consecutive Gateway Errors',
              type: 'number',
            },
            {
              path: 'consecutive5xxErrors',
              name: 'Consecutive 5xx Errors',
              type: 'number',
            },
            {
              path: 'interval',
              name: 'Interval',
            },
            {
              path: 'baseEjectionTime',
              name: 'Base Ejection Time',
            },
            {
              path: 'maxEjectionPercent',
              name: 'Max Ejection Percent',
            },
            {
              path: 'minHealthPercent',
              name: 'Min Health Percent',
            },
          ],
        },
        {
          path: 'tls',
          name: 'TLS',
          widget: 'FormGroup',
          children: [
            {
              path: 'mode',
              name: 'Mode',
            },
            {
              path: 'clientCertificate',
              name: 'Client Certificate',
            },
            {
              path: 'privateKey',
              name: 'Private Key',
            },
            {
              path: 'caCertificates',
              name: 'CA Certificates',
            },
            {
              path: 'credentialName',
              name: 'Credential Name',
            },
            {
              path: 'subjectAltNames',
              name: 'Subject Alt Names',
              widget: 'SimpleList',
            },
            {
              path: 'sni',
              name: 'SNI',
            },
            {
              path: 'insecureSkipVerify',
              name: 'Insecure Skip Verify',
            },
          ],
        },
        {
          path: 'portLevelSettings',
          name: 'Port Level Settings',
          widget: 'GenericList',
          children: [
            {
              path: '[].port.number',
              name: 'Port Number',
            },
            {
              widget: 'FormGroup',
              path: '[].loadBalancer',
              name: 'Load Balancer',
              children: [
                {
                  var: 'loadBalancerSelector',
                  name: 'chooseLoadBalancerSelector',
                  type: 'string',
                  enum: ['simple', 'consistentHash'],
                },
                {
                  path: 'simple',
                  name: 'Simple',
                  visibility: "$loadBalancerSelector = 'simple'",
                },
                {
                  widget: 'FormGroup',
                  path: 'consistentHash',
                  name: 'Consistent Hash',
                  visibility: "$loadBalancerSelector = 'consistentHash'",
                  children: [
                    {
                      var: 'consistentHashSelector',
                      name: 'chooseConsistentHashSelector',
                      type: 'string',
                      enum: [
                        'httpHeaderName',
                        'httpCookie',
                        'useSourceIp',
                        'httpQueryParameterName',
                      ],
                    },
                    {
                      path: 'httpHeaderName',
                      name: 'HTTP Header Name',
                      visibility: "$consistentHashSelector = 'httpHeaderName'",
                    },
                    {
                      path: 'httpCookie',
                      name: 'HTTP Cookie',
                      widget: 'FormGroup',
                      children: [
                        {
                          path: 'name',
                          name: 'Name',
                        },
                        {
                          path: 'path',
                          name: 'Path',
                        },
                        {
                          path: 'ttl',
                          name: 'TTL',
                        },
                      ],
                    },
                    {
                      path: 'useSourceIp',
                      name: 'Use Source IP',
                      visibility: "$consistentHashSelector = 'useSourceIp'",
                    },
                    {
                      path: 'httpQueryParameterName',
                      name: 'HTTP Query Parameter Name',
                      visibility:
                        "$consistentHashSelector = 'httpQueryParameterName'",
                    },
                    {
                      path: 'minimumRingSize',
                      name: 'Minimum Ring Size',
                    },
                  ],
                },
                {
                  path: 'localityLbSetting',
                  name: 'Locality LB Settings',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'enabled',
                      name: 'Enabled',
                      type: 'boolean',
                    },
                    {
                      path: 'distribute',
                      name: 'Distribute',
                      widget: 'GenericList',
                    },
                    {
                      path: 'distribute[].from',
                      name: 'From',
                    },
                    {
                      path: 'distribute[].to',
                      name: 'To',
                      widget: 'KeyValuePair',
                      valueType: 'number',
                    },
                    {
                      path: 'failover',
                      name: 'Failover',
                      widget: 'GenericList',
                    },
                    {
                      path: 'failover[].from',
                      name: 'From',
                    },
                    {
                      path: 'failover[].to',
                      name: 'To',
                    },
                    {
                      path: 'failoverPriority',
                      name: 'Failover Priority',
                      widget: 'SimpleList',
                    },
                  ],
                },
                {
                  path: 'warmupDurationSecs',
                  name: 'Warmup Duration Secs',
                },
              ],
            },
            {
              path: '[].connectionPool',
              name: 'Connection Pool',
              widget: 'FormGroup',
              children: [
                {
                  path: 'tcp',
                  name: 'TCP',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'maxConnections',
                      name: 'Max Connections',
                    },
                    {
                      path: 'connectTimeout',
                      name: 'Connect Timeout',
                    },
                    {
                      path: 'tcpKeepalive',
                      name: 'TCP Keep Alive',
                      widget: 'FormGroup',
                      children: [
                        {
                          path: 'probes',
                          name: 'Probes',
                        },
                        {
                          path: 'time',
                          name: 'Time',
                        },
                        {
                          path: 'interval',
                          name: 'Interval',
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'http',
                  name: 'HTTP',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'http1MaxPendingRequests',
                      name: 'HTTP1 Max Pending Requests',
                    },
                    {
                      path: 'http2MaxRequests',
                      name: 'HTTP2 Max Requests',
                    },
                    {
                      path: 'maxRequestsPerConnection',
                      name: 'Max Requests Per Connection',
                    },
                    {
                      path: 'maxRetries',
                      name: 'Max Retries',
                    },
                    {
                      path: 'idleTimeout',
                      name: 'Idle Timeout',
                    },
                    {
                      path: 'h2UpgradePolicy',
                      name: 'H2 Upgrade Policy',
                    },
                    {
                      path: 'useClientProtocol',
                      name: 'Use Client Protocol',
                    },
                  ],
                },
              ],
            },
            {
              path: '[].outlierDetection',
              widget: 'FormGroup',
              children: [
                {
                  path: 'splitExternalLocalOriginErrors',
                  name: 'Split External Local Origin Errors',
                },
                {
                  path: 'consecutiveLocalOriginFailures',
                  name: 'Consecutive Local Origin Failures',
                  type: 'number',
                },
                {
                  path: 'consecutiveGatewayErrors',
                  name: 'Consecutive Gateway Errors',
                  type: 'number',
                },
                {
                  path: 'consecutive5xxErrors',
                  name: 'Consecutive 5xx Errors',
                  type: 'number',
                },
                {
                  path: 'interval',
                  name: 'Interval',
                },
                {
                  path: 'baseEjectionTime',
                  name: 'Base Ejection Time',
                },
                {
                  path: 'maxEjectionPercent',
                  name: 'Max Ejection Percent',
                },
                {
                  path: 'minHealthPercent',
                  name: 'Min Health Percent',
                },
              ],
            },
            {
              path: '[].tls',
              name: 'TLS',
              widget: 'FormGroup',
              children: [
                {
                  path: 'mode',
                  name: 'Mode',
                },
                {
                  path: 'clientCertificate',
                  name: 'Client Certificate',
                },
                {
                  path: 'privateKey',
                  name: 'Private Key',
                },
                {
                  path: 'caCertificates',
                  name: 'CA Certificates',
                },
                {
                  path: 'credentialName',
                  name: 'Credential Name',
                },
                {
                  path: 'subjectAltNames',
                  name: 'Subject Alt Names',
                  widget: 'SimpleList',
                },
                {
                  path: 'sni',
                  name: 'SNI',
                },
                {
                  path: 'insecureSkipVerify',
                  name: 'Insecure Skip Verify',
                },
              ],
            },
          ],
        },
        {
          path: 'tunnel',
          name: 'Tunnel',
          widget: 'FormGroup',
          children: [
            {
              path: 'protocol',
              name: 'Protocol',
            },
            {
              path: 'targetHost',
              name: 'Target Host',
            },
            {
              path: 'targetPort',
              name: 'Target Port',
            },
          ],
        },
      ],
    },
    {
      path: 'spec.subsets',
      name: 'Subsets',
      widget: 'GenericList',
      children: [
        {
          path: '[].name',
          name: 'Name',
        },
        {
          path: '[].labels',
          name: 'Labels',
          widget: 'KeyValuePair',
        },
        {
          path: '[].trafficPolicy',
          name: 'Traffic Policy',
          children: [
            {
              widget: 'FormGroup',
              path: 'loadBalancer',
              name: 'Load Balancer',
              children: [
                {
                  var: 'loadBalancerSelector',
                  name: 'chooseLoadBalancerSelector',
                  type: 'string',
                  enum: ['simple', 'consistentHash'],
                },
                {
                  path: 'simple',
                  name: 'Simple',
                  visibility: "$loadBalancerSelector = 'simple'",
                },
                {
                  widget: 'FormGroup',
                  path: 'consistentHash',
                  name: 'Consistent Hash',
                  visibility: "$loadBalancerSelector = 'consistentHash'",
                  children: [
                    {
                      var: 'consistentHashSelector',
                      name: 'chooseConsistentHashSelector',
                      type: 'string',
                      enum: [
                        'httpHeaderName',
                        'httpCookie',
                        'useSourceIp',
                        'httpQueryParameterName',
                      ],
                    },
                    {
                      path: 'httpHeaderName',
                      name: 'HTTP Header Name',
                      visibility: "$consistentHashSelector = 'httpHeaderName'",
                    },
                    {
                      path: 'httpCookie',
                      name: 'HTTP Cookie',
                      widget: 'FormGroup',
                      children: [
                        {
                          path: 'name',
                          name: 'Name',
                        },
                        {
                          path: 'path',
                          name: 'Path',
                        },
                        {
                          path: 'ttl',
                          name: 'TTL',
                        },
                      ],
                    },
                    {
                      path: 'useSourceIp',
                      name: 'Use Source IP',
                      visibility: "$consistentHashSelector = 'useSourceIp'",
                    },
                    {
                      path: 'httpQueryParameterName',
                      name: 'HTTP Query Parameter Name',
                      visibility:
                        "$consistentHashSelector = 'httpQueryParameterName'",
                    },
                    {
                      path: 'minimumRingSize',
                      name: 'Minimum Ring Size',
                    },
                  ],
                },
                {
                  path: 'localityLbSetting',
                  name: 'Locality LB Settings',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'enabled',
                      name: 'Enabled',
                      type: 'boolean',
                    },
                    {
                      path: 'distribute',
                      name: 'Distribute',
                      widget: 'GenericList',
                    },
                    {
                      path: 'distribute[].from',
                      name: 'From',
                    },
                    {
                      path: 'distribute[].to',
                      name: 'To',
                      widget: 'KeyValuePair',
                      valueType: 'number',
                    },
                    {
                      path: 'failover',
                      name: 'Failover',
                      widget: 'GenericList',
                    },
                    {
                      path: 'failover[].from',
                      name: 'From',
                    },
                    {
                      path: 'failover[].to',
                      name: 'To',
                    },
                    {
                      path: 'failoverPriority',
                      name: 'Failover Priority',
                      widget: 'SimpleList',
                    },
                  ],
                },
                {
                  path: 'warmupDurationSecs',
                  name: 'Warmup Duration Secs',
                },
              ],
            },
            {
              path: 'connectionPool',
              name: 'Connection Pool',
              widget: 'FormGroup',
              children: [
                {
                  path: 'tcp',
                  name: 'TCP',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'maxConnections',
                      name: 'Max Connections',
                    },
                    {
                      path: 'connectTimeout',
                      name: 'Connect Timeout',
                    },
                    {
                      path: 'tcpKeepalive',
                      name: 'TCP Keep Alive',
                      widget: 'FormGroup',
                      children: [
                        {
                          path: 'probes',
                          name: 'Probes',
                        },
                        {
                          path: 'time',
                          name: 'Time',
                        },
                        {
                          path: 'interval',
                          name: 'Interval',
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'http',
                  name: 'HTTP',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'http1MaxPendingRequests',
                      name: 'HTTP1 Max Pending Requests',
                    },
                    {
                      path: 'http2MaxRequests',
                      name: 'HTTP2 Max Requests',
                    },
                    {
                      path: 'maxRequestsPerConnection',
                      name: 'Max Requests Per Connection',
                    },
                    {
                      path: 'maxRetries',
                      name: 'Max Retries',
                    },
                    {
                      path: 'idleTimeout',
                      name: 'Idle Timeout',
                    },
                    {
                      path: 'h2UpgradePolicy',
                      name: 'H2 Upgrade Policy',
                    },
                    {
                      path: 'useClientProtocol',
                      name: 'Use Client Protocol',
                    },
                  ],
                },
              ],
            },
            {
              path: 'outlierDetection',
              widget: 'FormGroup',
              children: [
                {
                  path: 'splitExternalLocalOriginErrors',
                  name: 'Split External Local Origin Errors',
                },
                {
                  path: 'consecutiveLocalOriginFailures',
                  name: 'Consecutive Local Origin Failures',
                  type: 'number',
                },
                {
                  path: 'consecutiveGatewayErrors',
                  name: 'Consecutive Gateway Errors',
                  type: 'number',
                },
                {
                  path: 'consecutive5xxErrors',
                  name: 'Consecutive 5xx Errors',
                  type: 'number',
                },
                {
                  path: 'interval',
                  name: 'Interval',
                },
                {
                  path: 'baseEjectionTime',
                  name: 'Base Ejection Time',
                },
                {
                  path: 'maxEjectionPercent',
                  name: 'Max Ejection Percent',
                },
                {
                  path: 'minHealthPercent',
                  name: 'Min Health Percent',
                },
              ],
            },
            {
              path: 'tls',
              name: 'TLS',
              widget: 'FormGroup',
              children: [
                {
                  path: 'mode',
                  name: 'Mode',
                },
                {
                  path: 'clientCertificate',
                  name: 'Client Certificate',
                },
                {
                  path: 'privateKey',
                  name: 'Private Key',
                },
                {
                  path: 'caCertificates',
                  name: 'CA Certificates',
                },
                {
                  path: 'credentialName',
                  name: 'Credential Name',
                },
                {
                  path: 'subjectAltNames',
                  name: 'Subject Alt Names',
                  widget: 'SimpleList',
                },
                {
                  path: 'sni',
                  name: 'SNI',
                },
                {
                  path: 'insecureSkipVerify',
                  name: 'Insecure Skip Verify',
                },
              ],
            },
            {
              path: 'portLevelSettings',
              name: 'Port Level Settings',
              widget: 'GenericList',
              children: [
                {
                  path: '[].port.number',
                  name: 'Port Number',
                },
                {
                  widget: 'FormGroup',
                  path: '[].loadBalancer',
                  name: 'Load Balancer',
                  children: [
                    {
                      var: 'loadBalancerSelector',
                      name: 'chooseLoadBalancerSelector',
                      type: 'string',
                      enum: ['simple', 'consistentHash'],
                    },
                    {
                      path: 'simple',
                      name: 'Simple',
                      visibility: "$loadBalancerSelector = 'simple'",
                    },
                    {
                      widget: 'FormGroup',
                      path: 'consistentHash',
                      name: 'Consistent Hash',
                      visibility: "$loadBalancerSelector = 'consistentHash'",
                      children: [
                        {
                          var: 'consistentHashSelector',
                          name: 'chooseConsistentHashSelector',
                          type: 'string',
                          enum: [
                            'httpHeaderName',
                            'httpCookie',
                            'useSourceIp',
                            'httpQueryParameterName',
                          ],
                        },
                        {
                          path: 'httpHeaderName',
                          name: 'HTTP Header Name',
                          visibility:
                            "$consistentHashSelector = 'httpHeaderName'",
                        },
                        {
                          path: 'httpCookie',
                          name: 'HTTP Cookie',
                          widget: 'FormGroup',
                          children: [
                            {
                              path: 'name',
                              name: 'Name',
                            },
                            {
                              path: 'path',
                              name: 'Path',
                            },
                            {
                              path: 'ttl',
                              name: 'TTL',
                            },
                          ],
                        },
                        {
                          path: 'useSourceIp',
                          name: 'Use Source IP',
                          visibility: "$consistentHashSelector = 'useSourceIp'",
                        },
                        {
                          path: 'httpQueryParameterName',
                          name: 'HTTP Query Parameter Name',
                          visibility:
                            "$consistentHashSelector = 'httpQueryParameterName'",
                        },
                        {
                          path: 'minimumRingSize',
                          name: 'Minimum Ring Size',
                        },
                      ],
                    },
                    {
                      path: 'localityLbSetting',
                      name: 'Locality LB Settings',
                      widget: 'FormGroup',
                      children: [
                        {
                          path: 'enabled',
                          name: 'Enabled',
                          type: 'boolean',
                        },
                        {
                          path: 'distribute',
                          name: 'Distribute',
                          widget: 'GenericList',
                        },
                        {
                          path: 'distribute[].from',
                          name: 'From',
                        },
                        {
                          path: 'distribute[].to',
                          name: 'To',
                          widget: 'KeyValuePair',
                          valueType: 'number',
                        },
                        {
                          path: 'failover',
                          name: 'Failover',
                          widget: 'GenericList',
                        },
                        {
                          path: 'failover[].from',
                          name: 'From',
                        },
                        {
                          path: 'failover[].to',
                          name: 'To',
                        },
                        {
                          path: 'failoverPriority',
                          name: 'Failover Priority',
                          widget: 'SimpleList',
                        },
                      ],
                    },
                    {
                      path: 'warmupDurationSecs',
                      name: 'Warmup Duration Secs',
                    },
                  ],
                },
                {
                  path: '[].connectionPool',
                  name: 'Connection Pool',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'tcp',
                      name: 'TCP',
                      widget: 'FormGroup',
                      children: [
                        {
                          path: 'maxConnections',
                          name: 'Max Connections',
                        },
                        {
                          path: 'connectTimeout',
                          name: 'Connect Timeout',
                        },
                        {
                          path: 'tcpKeepalive',
                          name: 'TCP Keep Alive',
                          widget: 'FormGroup',
                          children: [
                            {
                              path: 'probes',
                              name: 'Probes',
                            },
                            {
                              path: 'time',
                              name: 'Time',
                            },
                            {
                              path: 'interval',
                              name: 'Interval',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      path: 'http',
                      name: 'HTTP',
                      widget: 'FormGroup',
                      children: [
                        {
                          path: 'http1MaxPendingRequests',
                          name: 'HTTP1 Max Pending Requests',
                        },
                        {
                          path: 'http2MaxRequests',
                          name: 'HTTP2 Max Requests',
                        },
                        {
                          path: 'maxRequestsPerConnection',
                          name: 'Max Requests Per Connection',
                        },
                        {
                          path: 'maxRetries',
                          name: 'Max Retries',
                        },
                        {
                          path: 'idleTimeout',
                          name: 'Idle Timeout',
                        },
                        {
                          path: 'h2UpgradePolicy',
                          name: 'H2 Upgrade Policy',
                        },
                        {
                          path: 'useClientProtocol',
                          name: 'Use Client Protocol',
                        },
                      ],
                    },
                  ],
                },
                {
                  path: '[].outlierDetection',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'splitExternalLocalOriginErrors',
                      name: 'Split External Local Origin Errors',
                    },
                    {
                      path: 'consecutiveLocalOriginFailures',
                      name: 'Consecutive Local Origin Failures',
                      type: 'number',
                    },
                    {
                      path: 'consecutiveGatewayErrors',
                      name: 'Consecutive Gateway Errors',
                      type: 'number',
                    },
                    {
                      path: 'consecutive5xxErrors',
                      name: 'Consecutive 5xx Errors',
                      type: 'number',
                    },
                    {
                      path: 'interval',
                      name: 'Interval',
                    },
                    {
                      path: 'baseEjectionTime',
                      name: 'Base Ejection Time',
                    },
                    {
                      path: 'maxEjectionPercent',
                      name: 'Max Ejection Percent',
                    },
                    {
                      path: 'minHealthPercent',
                      name: 'Min Health Percent',
                    },
                  ],
                },
                {
                  path: '[].tls',
                  name: 'TLS',
                  widget: 'FormGroup',
                  children: [
                    {
                      path: 'mode',
                      name: 'Mode',
                    },
                    {
                      path: 'clientCertificate',
                      name: 'Client Certificate',
                    },
                    {
                      path: 'privateKey',
                      name: 'Private Key',
                    },
                    {
                      path: 'caCertificates',
                      name: 'CA Certificates',
                    },
                    {
                      path: 'credentialName',
                      name: 'Credential Name',
                    },
                    {
                      path: 'subjectAltNames',
                      name: 'Subject Alt Names',
                      widget: 'SimpleList',
                    },
                    {
                      path: 'sni',
                      name: 'SNI',
                    },
                    {
                      path: 'insecureSkipVerify',
                      name: 'Insecure Skip Verify',
                    },
                  ],
                },
              ],
            },
            {
              path: 'tunnel',
              name: 'Tunnel',
              widget: 'FormGroup',
              children: [
                {
                  path: 'protocol',
                  name: 'Protocol',
                },
                {
                  path: 'targetHost',
                  name: 'Target Host',
                },
                {
                  path: 'targetPort',
                  name: 'Target Port',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: 'spec.exportTo',
      name: 'Export To',
      widget: 'SimpleList',
    },
    {
      path: 'spec.workloadSelector.matchLabels',
      name: 'Match Labels of Workload Selector ',
      widget: 'KeyValuePair',
    },
  ],
  list: [
    {
      source: 'spec.host',
      name: 'Host',
    },
  ],
  translations: {
    en: {
      'metadata.annotations': 'Annotations',
      'metadata.labels': 'Labels',
      'metadata.creationTimestamp': 'Created at',
      'resource.description':
        '{{[Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule)}} specifies rules that apply to traffic intended for a service after routing.',
      References: 'References',
      probes: 'Probes',
      'Export To': 'Export To',
      'Match Labels of Workload Selector ':
        'Match Labels of Workload Selector ',
      'Traffic Policy': 'Traffic Policy',
      Interval: 'Interval',
      Name: 'Name',
      time: 'Time',
      interval: 'Interval',
      Host: 'Host',
      'Connection Pool': 'Connection Pool',
      'TCP Keep Alive': 'TCP Keep Alive',
      Probes: 'Probes',
      Time: 'Time',
      TCP: 'TCP',
      HTTP: 'HTTP',
      'HTTP1 Max Pending Requests': 'HTTP1 Max Pending Requests',
      'Max Connections': 'Max Connections',
      'Connect Timeout': 'Connect Timeout',
      'HTTP2 Max Requests': 'HTTP2 Max Requests',
      'Max Requests Per Connection': 'Max Requests Per Connection',
      'Max Retries': 'Max Retries',
      'Idle Timeout': 'Idle Timeout',
      'H2 Upgrade Policy': 'H2 Upgrade Policy',
      'Use Client Protocol': 'Use Client Protocol',
      'Locality LB Settings': 'Locality LB Settings',
      Enabled: 'Enabled',
      Distribute: 'Distribute',
      From: 'From',
      To: 'To',
      Failover: 'Failover',
      'Failover Priority': 'Failover Priority',
      'HTTP Cookie': 'HTTP Cookie',
      Path: 'Path',
      TTL: 'TTL',
      'Consistent Hash': 'Consistent Hash',
      'HTTP Header Name': 'HTTP Header Name',
      'Use Source IP': 'Use Source IP',
      'HTTP Query Parameter Name': 'HTTP Query Parameter Name',
      'Minimum Ring Size': 'Minimum Ring Size',
      'Load Balancer': 'Load Balancer',
      Simple: 'Simple',
      'Warmup Duration Secs': 'Warmup Duration Secs',
      'Split External Local Origin Errors':
        'Split External Local Origin Errors',
      'Consecutive Local Origin Failures': 'Consecutive Local Origin Failures',
      'Consecutive Gateway Errors': 'Consecutive Gateway Errors',
      'Consecutive 5xx Errors': 'Consecutive 5xx Errors',
      'Base Ejection Time': 'Base Ejection Time',
      'Max Ejection Percent': 'Max Ejection Percent',
      'Min Health Percent': 'Min Health Percent',
      'Port Level Settings': 'Port Level Settings',
      'Port Number': 'Port Number',
      TLS: 'TLS',
      Mode: 'Mode',
      'Client Certificate': 'Client Certificate',
      'Private Key': 'Private Key',
      'CA Certificates': 'CA Certificates',
      'Credential Name': 'Credential Name',
      'Subject Alt Names': 'Subject Alt Names',
      SNI: 'SNI',
      'Insecure Skip Verify': 'Insecure Skip Verify',
      Tunnel: 'Tunnel',
      Protocol: 'Protocol',
      'Target Host': 'Target Host',
      'Target Port': 'Target Port',
      Subsets: 'Subsets',
      Labels: 'Labels',
    },
  },
};
