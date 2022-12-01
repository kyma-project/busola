import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty, partial } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configurationState } from '../configurationSelector';
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
    const permissionSet = get(permissionSetsSelector);
    const configuration = get(configurationState);
    const features = configuration?.features;
    console.log(configuration, features);

    const areDependenciesInitialized =
      !isEmpty(openapiPathIdList) &&
      !!features &&
      !isEmpty(resourceList) &&
      !isEmpty(permissionSet);

    console.log(
      '0',
      !isEmpty(openapiPathIdList),
      !!features,
      !isEmpty(resourceList),
      !isEmpty(permissionSet),
    );
    if (!areDependenciesInitialized) {
      return [];
    }

    const configSet = {
      configFeatures: features!,
      openapiPathIdList,
      permissionSet,
    };
    console.log('1');
    const isNodeVisibleForCurrentConfigSet = partial(
      shouldNodeBeVisible,
      configSet,
    );
    console.log('2', isNodeVisibleForCurrentConfigSet);
    const navNodes: NavNode[] = resourceList.filter(
      isNodeVisibleForCurrentConfigSet,
    );

    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';
    const navNodesWithAddons = addAdditionalNodes(navNodes, scope, features!);

    return navNodesWithAddons;
  },
});
