import { loadBalancer } from 'components/Extensibility/tempRes/loadBalancerParent';

export const portLevelSettings = prefix => ({
  source: '$parent.portLevelSettings',
  // source: `$map(${prefix}portLevelSettings), function(el) {el}`,
  name: 'portLevelSettings',
  widget: 'Table',
  children: [{ source: '$item.port.number', name: 'port' }],
  // collapsible: [loadBalancer('$item.')],
  collapsible: [
    // {
    //   source: '$item.loadBalancer.simple',
    //   name: 'loadBalancer.simple',
    // },
    // {
    //   source: '$item.loadBalancer',
    //   name: 'loadBalancer',
    //   widget: 'CodeViewer',
    // },
    loadBalancer('$item.'),
    {
      source: '$item.loadBalancer',
      name: 'loadBalancer',
      visibility: '$exists($.data)',
      // widget: 'CodeViewer',
      widget: 'Panel',
      children: [
        {
          source: '$parent.simple',
          name: 'simple',
          // visibility: '$exists($.data)',
        },
      ],
    },
  ],
});
