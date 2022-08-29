const consistentHash = prefix => ({
  source: prefix + 'consistentHash',
  name: 'consistentHash',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: prefix + 'consistentHash.httpHeaderName',
      name: 'httpHeaderName',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'consistentHash.useSourceIp',
      name: 'useSourceIp',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'consistentHash.httpQueryParameterName',
      name: 'httpQueryParameterName',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'consistentHash.minimumRingSize',
      name: 'minimumRingSize',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'consistentHash.httpCookie',
      name: 'httpCookie',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: prefix + 'consistentHash.httpCookie.name',
          name: 'name',
        },
        {
          source: prefix + 'consistentHash.httpCookie.path',
          name: 'path',
        },
        {
          source: prefix + 'consistentHash.httpCookie.ttl',
          name: 'ttl',
        },
      ],
    },
  ],
});
export const loadBalancer = prefix => ({
  source: '$item.loadBalancer',
  name: 'loadBalancer',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.simple',
      name: 'simple',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.warmupDurationSecs',
      name: 'warmupDurationSecs',
      visibility: '$exists($.data)',
    },
    // consistentHash(prefix + 'loadBalancer.'),
    {
      source: '$parent.localityLbSetting',
      name: 'localityLbSetting',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          name: 'enabled',
          source: '$parent.localityLbSetting.enabled',
        },
        {
          widget: 'Table',
          name: 'localityLbSetting.distribute',
          visibility: '$count(data)',
          source: '$parent.localityLbSetting.distribute',
          children: [
            { source: '$item.from', name: 'from' },
            { source: '$item.to', name: 'to', widget: 'Labels' },
          ],
        },
        {
          widget: 'Table',
          name: 'localityLbSetting.failover',
          visibility: '$count(data)',
          source: '$parent.localityLbSetting.failover',
          children: [
            { source: '$item.from', name: 'from' },
            { source: '$item.to', name: 'to' },
          ],
        },
        {
          name: 'localityLbSetting.failoverPriority',
          source: '$parent.localityLbSetting.failoverPriority',
          widget: 'JoinedArray',
          visibility: '$count(data)',
        },
      ],
    },
  ],
});
