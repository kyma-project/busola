import { trafficPolicy } from './trafficPolicy';

export const subsets = prefix => ({
  source: `${prefix}subsets`,
  name: 'Subsets',
  widget: 'Table',
  visibility: '$count(data)',
  children: [
    { source: '$item.name', name: 'Name' },
    { source: '$item.labels', name: 'Labels', widget: 'Labels' },
  ],
  collapsible: [trafficPolicy('$item.')],
});
