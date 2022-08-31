const consistentHash = {
  source: '$parent.consistentHash',
  name: 'consistentHash',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.httpHeaderName',
      name: 'httpHeaderName',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.useSourceIp',
      name: 'useSourceIp',
      visibility: '$exists($.data)',
      widget: 'Badge',
      highlights: {
        positive: ['true'],
        negative: ['false'],
      },
    },
    {
      source: '$parent.httpQueryParameterName',
      name: 'httpQueryParameterName',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.minimumRingSize',
      name: 'minimumRingSize',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.httpCookie',
      name: 'httpCookie',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: '$parent.name',
          name: 'name',
        },
        {
          source: '$parent.path',
          name: 'path',
        },
        {
          source: '$parent.ttl',
          name: 'ttl',
        },
      ],
    },
  ],
};
export const loadBalancer = prefix => ({
  source: prefix + 'loadBalancer',
  name: 'loadBalancer',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.simple',
      name: 'simple',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
    {
      source: '$parent.warmupDurationSecs',
      name: 'warmupDurationSecs',
      visibility: '$exists($.data)',
    },
    consistentHash,
    {
      source: '$parent.localityLbSetting',
      name: 'localityLbSetting',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          name: 'enabled',
          source: '$parent.enabled',
          widget: 'Badge',
          highlights: {
            positive: ['true'],
            negative: ['false'],
          },
        },
        {
          widget: 'Table',
          name: 'localityLbSetting.distribute',
          visibility: '$count(data)',
          source: '$parent.distribute',
          children: [
            { source: '$item.from', name: 'from' },
            { source: '$item.to', name: 'to', widget: 'Labels' },
          ],
        },
        {
          widget: 'Table',
          name: 'localityLbSetting.failover',
          visibility: '$count(data)',
          source: '$parent.failover',
          children: [
            { source: '$item.from', name: 'from' },
            { source: '$item.to', name: 'to' },
          ],
        },
        {
          name: 'localityLbSetting.failoverPriority',
          source: '$parent.failoverPriority',
          widget: 'JoinedArray',
          visibility: '$count(data)',
        },
      ],
    },
  ],
});
