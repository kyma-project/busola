export const tunnel = prefix => ({
  source: prefix + 'tunnel',
  name: 'tunnel',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: prefix + 'tunnel.protocol',
      name: 'protocol',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
    {
      source: prefix + 'tunnel.targetHost',
      name: 'targetHost',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'tunnel.targetPort',
      name: 'targetPort',
      visibility: '$exists($.data)',
    },
  ],
});
