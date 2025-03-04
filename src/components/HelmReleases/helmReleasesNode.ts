import { NavNode } from 'state/types';

export const helmReleasesNode: NavNode = {
  category: 'Apps',
  resourceType: 'helmreleases',
  resourceTypeCased: 'HelmReleases',
  pathSegment: 'helm-releases',
  label: 'Helm Releases',
  namespaced: true,
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: 'v1',
};
