import { selector } from 'recoil';
import { completeResourceListSelector } from '../resourceList/completeResourceListSelector';
import { fetchPermissions } from './fetchPermissions';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { isEmpty } from 'lodash';
import { NavNode } from '../types';
import { filterExistingAndAllowedNodes } from '../../sidebar/filterExistingAndAllowedNodes';
import { configFeaturesState } from '../configFeaturesAtom';

export const navigationNodesSelector = selector({
  key: 'navigationNodesSelector',

  get: async ({ get }) => {
    const resourceList = get(completeResourceListSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const openapiPathIdList = get(openapiPathIdListSelector);
    const configFeatures = get(configFeaturesState);

    if (isEmpty(openapiPathIdList) || isEmpty(resourceList)) return [];

    const permissionSet = await fetchPermissions(get);

    const scope = activeNamespaceId ? 'namespace' : 'cluster';
    const currentScopeNodes = filterByScope(resourceList, scope);

    const allowedNodes = currentScopeNodes.filter(node =>
      filterExistingAndAllowedNodes(
        node,
        permissionSet,
        openapiPathIdList,
        configFeatures,
      ),
    );
    const sortedNodes = sortByCategories(allowedNodes);

    return sortedNodes;
  },
});

const filterByScope = (navList: NavNode[], scope: 'cluster' | 'namespace') => {
  if (!(scope === 'cluster' || scope === 'namespace')) {
    console.error('Navigation scope is not defined.');
    return [];
  }
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

const sortByCategories = (navList: NavNode[]): any => {
  const sortedToCategories: any = {};

  navList.forEach(resource => {
    const categoryKey = resource.category;

    if (!sortedToCategories[categoryKey]) {
      sortedToCategories[categoryKey] = [];
    }
    sortedToCategories[categoryKey].push(resource);
  });

  return sortedToCategories;
};
