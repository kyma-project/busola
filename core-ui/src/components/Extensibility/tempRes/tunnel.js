export const tunnel = prefix => ({
  source: prefix + 'tunnel',
  name: 'tunnel',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.protocol',
      name: 'protocol',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
    {
      source: '$parent.targetHost',
      name: 'targetHost',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.targetPort',
      name: 'targetPort',
      visibility: '$exists($.data)',
    },
  ],
});
