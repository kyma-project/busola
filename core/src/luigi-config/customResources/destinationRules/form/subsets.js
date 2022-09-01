import { trafficPolicyBundle } from './trafficPolicy/trafficPolicyBundle';

export const subsets = {
  path: 'spec.subsets',
  name: 'Subsets',
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
