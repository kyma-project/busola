import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configFeaturesState } from '../configFeaturesAtom';
import { filterExistingNodes } from './filters/filterExistingNodes';
import { filterScopeNodes } from './filters/filterScopeNodes';
import { filterNodesWithDisabledFeatures } from './filters/filterNodesWithDisabledFeatures';
import { assignNodesToCategories } from './assignToCategories';
import { filterPermittedNodes } from './filters/filterPermittedNodes';
import { permissionSetsAtom } from '../permissionSetsAtom';
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
    const permissionSet = get(permissionSetsAtom);

    const areDependenciesInitialized =
      openapiPathIdList &&
      configFeatures &&
      !isEmpty(resourceList) &&
      activeNamespaceId !== defaultNamespaceName &&
      !isEmpty(permissionSet);

    if (!areDependenciesInitialized) {
      return [];
    }

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
