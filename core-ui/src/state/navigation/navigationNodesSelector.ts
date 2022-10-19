import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import { fetchPermissions, PermissionSet } from './fetchPermissions';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configFeaturesState } from '../configFeaturesAtom';
import { filterExistingNodes } from './filters/filterExistingNodes';
import { filterScopeNodes } from './filters/filterScopeNodes';
import { filterNodesWithDisabledFeatures } from './filters/filterNodesWithDisabledFeatures';
import { assignNodesToCategories } from './assignToCategories';
import { Category } from './categories';
import { NavNode } from '../types';
import { filterPermittedNodes } from './filters/filterPermittedNodes';

export const navigationNodesSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'navigationNodesSelector',
  get: async ({ get }) => {
    const resourceList: NavNode[] = get(resourceListSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const openapiPathIdList = get(openapiPathIdListSelector);
    const configFeatures = get(configFeaturesState);

    if (!openapiPathIdList || !configFeatures || isEmpty(resourceList))
      return [];
    const permissionSet = (await fetchPermissions(get)) as PermissionSet[];

    const scope = activeNamespaceId ? 'namespace' : 'cluster';

    const currentScopeNodes: NavNode[] = filterScopeNodes(resourceList, scope);

    const noDisabledFeaturesNodes: NavNode[] = filterNodesWithDisabledFeatures(
      currentScopeNodes,
      configFeatures,
    );

    const existingNodes: NavNode[] = filterExistingNodes(
      noDisabledFeaturesNodes,
      openapiPathIdList,
    );

    const allowedNodes: NavNode[] = filterPermittedNodes(
      existingNodes,
      permissionSet,
    );

    const assignedToCategories: Category[] = assignNodesToCategories(
      allowedNodes,
    );

    return assignedToCategories;
  },
});
