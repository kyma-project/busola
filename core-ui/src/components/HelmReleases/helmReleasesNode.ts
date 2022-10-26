import { NavNode } from 'state/types';

export const helmReleasesNode: NavNode = {
  category: 'Apps',
  resourceType: 'helmreleases',
  pathSegment: 'helmreleases',
  label: 'Helm Releases',
  namespaced: true,
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: 'v1',
};
