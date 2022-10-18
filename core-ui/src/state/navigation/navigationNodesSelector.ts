import { selector } from 'recoil';
import { completeResourceListSelector } from '../resourceList/completeResourceListSelector';
import { fetchPermissions } from './fetchPermissions';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { cloneDeep, isEmpty } from 'lodash';
import { NavNode } from '../types';
import { filterExistingAndAllowedNodes } from './filterExistingAndAllowedNodes';
import { configFeaturesState } from '../configFeaturesAtom';
import { CATEGORIES, Category } from './categories';

export const navigationNodesSelector = selector<Category[]>({
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
    const assignedToCategories = assignNodesToCategories(allowedNodes);

    return assignedToCategories;
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

const assignNodesToCategories = (navList: NavNode[]): Category[] => {
  const categories = cloneDeep(CATEGORIES);

  navList.forEach(node => {
    //TODO process the top level nodes
    if (
      (node.resourceType === 'events' || node.resourceType === 'namespaces') &&
      node.apiGroup === ''
    ) {
      categories.unshift({
        topLevelNode: true,
        key: '',
        label: '',
        icon: '',
        items: [node],
      });
      return;
    }

    const existingCategory = categories.find(
      category => category.key === node.category,
    );

    if (existingCategory) {
      existingCategory.items.push(node);
    } else {
      categories.push({
        key: node.category,
        label: node.label || node.category,
        icon: node.icon || 'customize',
        items: [node],
      });
    }
  });

  return categories;
};
