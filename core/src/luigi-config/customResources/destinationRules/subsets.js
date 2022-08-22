import { trafficPolicyBundle } from './trafficPolicy/trafficPolicyBundle';

export const subsets = {
  path: 'spec.subsets',
  simple: true,
  widget: 'GenericList',
  children: [
    { path: '[].name' },
    { path: '[].labels', widget: 'KeyValuePair' },
    {
      path: '[].trafficPolicy',
      children: trafficPolicyBundle,
    },
  ],
};
