import { trafficPolicy } from 'components/Extensibility/tempRes/trafficPolicy';

export const subsets = prefix => ({
  source: prefix + 'subsets',
  name: 'subsets',
  widget: 'Table',
  visibility: '$count(data)',
  children: [
    { source: '$item.name', name: 'name' },
    { source: '$item.labels', name: 'labels', widget: 'Labels' },
  ],
  collapsible: [trafficPolicy('$item.')],
});
