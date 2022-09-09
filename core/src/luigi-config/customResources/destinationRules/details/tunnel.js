export const tunnel = prefix => ({
  source: `${prefix}tunnel`,
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
});
