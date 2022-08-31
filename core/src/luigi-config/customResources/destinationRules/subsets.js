import { trafficPolicyBundle } from './trafficPolicy/trafficPolicyBundle';

export const subsets = {
  path: 'spec.subsets',
  name: 'Subsets',
  simple: true,
  widget: 'GenericList',
  children: [
    { path: '[].name', name: 'Name' },
    { path: '[].labels', name: 'Labels', widget: 'KeyValuePair' },
    {
      path: '[].trafficPolicy',
      name: 'Traffic Policy',
      children: trafficPolicyBundle,
    },
  ],
};
