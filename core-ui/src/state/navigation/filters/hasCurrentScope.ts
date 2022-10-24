import { NavNode } from '../../types';

export const hasCurrentScope = (
  navNode: NavNode,
  scope: 'cluster' | 'namespace',
): boolean => {
  const isNamespace = scope === 'namespace';
  const isCluster = scope === 'cluster';

  if (isNamespace) {
    return navNode.namespaced;
  }
  if (isCluster) {
    return !navNode.namespaced;
  }
  return false;
};
