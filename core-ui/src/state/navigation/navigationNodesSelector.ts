import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import { fetchPermissions } from './fetchPermissions';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configFeaturesState } from '../configFeaturesAtom';
import { filterExistingAndAllowedNodes } from './filterExistingAndAllowedNodes';
import { filterByScope } from './filterByScope';
import { assignNodesToCategories } from './assignToCategories';
import { Category } from './categories';
import { NavNode } from '../types';

export const navigationNodesSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'navigationNodesSelector',
  get: async ({ get }) => {
    const resourceList: NavNode[] = get(resourceListSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const openapiPathIdList = get(openapiPathIdListSelector);
    const configFeatures = get(configFeaturesState);

    if (!openapiPathIdList || isEmpty(resourceList)) return [];

    const permissionSet = await fetchPermissions(get);
    const scope = activeNamespaceId ? 'namespace' : 'cluster';

    const currentScopeNodes: NavNode[] = filterByScope(resourceList, scope);

    const allowedNodes: NavNode[] = currentScopeNodes.filter(node =>
      filterExistingAndAllowedNodes(
        node,
        permissionSet,
        openapiPathIdList,
        configFeatures,
      ),
    );

    const assignedToCategories: Category[] = assignNodesToCategories(
      allowedNodes,
    );

    return assignedToCategories;
  },
});
