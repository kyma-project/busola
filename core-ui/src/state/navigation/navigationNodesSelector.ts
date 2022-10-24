import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty, partial } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configFeaturesState } from '../configFeaturesAtom';
import { assignNodesToCategories } from './assignToCategories';
import { permissionSetsAtom } from '../permissionSetsAtom';
import { Category } from './categories';
import { NavNode, Scope } from '../types';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';
import { addAdditionalNodes } from './addAdditionalNodes';

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
      openapiPathIdList && //
      configFeatures && //
      !isEmpty(resourceList) &&
      activeNamespaceId !== defaultNamespaceName &&
      !isEmpty(permissionSet);

    if (!areDependenciesInitialized) {
      return [];
    }

    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';
    const configSet = {
      scope,
      configFeatures,
      openapiPathIdList,
      permissionSet,
    };
    const isNodeVisibleForCurrentConfigSet = partial(
      shouldNodeBeVisible,
      configSet,
    );
    const navNodes: NavNode[] = resourceList.filter(
      isNodeVisibleForCurrentConfigSet,
    );

    const extendedNavNodes = addAdditionalNodes(
      navNodes,
      scope,
      configFeatures,
    );

    const assignedToCategories: Category[] = assignNodesToCategories(
      extendedNavNodes,
    );

    return assignedToCategories;
  },
});
