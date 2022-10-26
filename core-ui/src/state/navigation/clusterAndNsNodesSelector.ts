import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty, partial } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configFeaturesState } from '../configFeatures/configFeaturesAtom';
import { permissionSetsSelector } from '../permissionSetsSelector';
import { NavNode, Scope } from '../types';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';
import { addAdditionalNodes } from './addAdditionalNodes';

export const clusterAndNsNodesSelector: RecoilValueReadOnly<NavNode[]> = selector<
  NavNode[]
>({
  key: 'navigationNodesSelector',
  get: async ({ get }) => {
    const resourceList: NavNode[] = get(resourceListSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const openapiPathIdList = get(openapiPathIdListSelector);
    const configFeatures = get(configFeaturesState);
    const permissionSet = get(permissionSetsSelector);
    console.log(1111, 'areDependenciesInitialized');

    const areDependenciesInitialized =
      openapiPathIdList && //
      configFeatures && //
      !isEmpty(resourceList) &&
      activeNamespaceId !== defaultNamespaceName &&
      !isEmpty(permissionSet);

    console.log(1111, areDependenciesInitialized);

    if (!areDependenciesInitialized) {
      return [];
    }

    const configSet = {
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

    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';
    const extendedNavNodes = addAdditionalNodes(
      navNodes,
      scope,
      configFeatures,
    );

    return extendedNavNodes;
  },
});
