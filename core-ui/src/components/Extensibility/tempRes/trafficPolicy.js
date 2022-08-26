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
              visibility: '$exists($.data)',
              source:
                prefix +
                'trafficPolicy.loadBalancer.localityLbSetting.distribute',
              children: [
                { source: '$item.from', name: 'from' },
                { source: '$item.to', name: 'to', widget: 'Labels' },
              ],
            },
            {
              widget: 'JoinedArray',
              name: 'localityLbSetting.failoverPriority',
              visibility: '$exists($.data)',
              source:
                prefix +
                'trafficPolicy.loadBalancer.localityLbSetting.failoverPriority',
            },
          ],
        },
      ],
    },
  ],
});
