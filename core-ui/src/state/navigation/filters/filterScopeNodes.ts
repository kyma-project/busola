import { NavNode } from '../../types';

export const filterScopeNodes = (
  navList: NavNode[],
  scope: 'cluster' | 'namespace',
) => {
  const isNamespace = scope === 'namespace';
  const isCluster = scope === 'cluster';

  const filteredList = navList.filter(resource => {
    if (isNamespace) {
      return resource.namespaced;
    }
    if (isCluster) {
      return !resource.namespaced;
    }
    return false;
  });
  return filteredList;
};
