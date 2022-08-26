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

export const trafficPolicy = prefix => ({
  source: prefix + 'trafficPolicy',
  name: 'trafficPolicy',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: prefix + 'trafficPolicy.loadBalancer',
      name: 'loadBalancer',
      visibility: '$exists($.data)',
      widget: 'Panel',
      children: [
        {
          source: prefix + 'trafficPolicy.loadBalancer.simple',
          name: 'simple',
          visibility: '$exists($.data)',
        },
        {
          source: prefix + 'trafficPolicy.loadBalancer.warmupDurationSecs',
          name: 'warmupDurationSecs',
          visibility: '$exists($.data)',
        },
        consistentHash(prefix + 'trafficPolicy.loadBalancer.'),
        {
          source: prefix + 'trafficPolicy.loadBalancer.localityLbSetting',
          name: 'localityLbSetting',
          visibility: '$exists($.data)',
          widget: 'Panel',
          children: [
            {
              name: 'enabled',
              source:
                prefix + 'trafficPolicy.loadBalancer.localityLbSetting.enabled',
            },
            {
              widget: 'Table',
              name: 'localityLbSetting.distribute',
              visibility: '$count(data)',
              source:
                prefix +
                'trafficPolicy.loadBalancer.localityLbSetting.distribute',
              children: [
                { source: '$item.from', name: 'from' },
                { source: '$item.to', name: 'to', widget: 'Labels' },
              ],
            },
            {
              widget: 'Table',
              name: 'localityLbSetting.failover',
              visibility: '$count(data)',
              source:
                prefix +
                'trafficPolicy.loadBalancer.localityLbSetting.failover',
              children: [
                { source: '$item.from', name: 'from' },
                { source: '$item.to', name: 'to' },
              ],
            },
            {
              name: 'localityLbSetting.failoverPriority',
              source:
                prefix +
                'trafficPolicy.loadBalancer.localityLbSetting.failoverPriority',
              widget: 'JoinedArray',
              visibility: '$count(data)',
            },
          ],
        },
      ],
    },
  ],
});
