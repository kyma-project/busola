const consistentHash = {
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
};
export const loadBalancer = prefix => ({
  source: prefix + 'loadBalancer',
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
    consistentHash,
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
            { source: '$item.from', name: 'From' },
            { source: '$item.to', name: 'To', widget: 'Labels' },
          ],
        },
        {
          widget: 'Table',
          name: 'Failover',
          visibility: '$count(data)',
          source: '$parent.failover',
          children: [
            { source: '$item.from', name: 'From' },
            { source: '$item.to', name: 'To' },
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
});
