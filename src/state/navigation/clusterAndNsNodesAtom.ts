import { atom } from 'jotai';
import { isEmpty, partial } from 'lodash';
import { resourceListAtom } from '../resourceList/resourceListAtom';
import { activeNamespaceIdAtom } from '../activeNamespaceIdAtom';
import { openapiPathIdListAtom } from '../openapi/openapiPathIdAtom';
import { configurationAtom } from '../configuration/configurationAtom';
import { permissionSetsAtom } from '../permissionSetsAtom';
import { NavNode, Scope } from '../types';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';
import { addAdditionalNodes } from './addAdditionalNodes';
import { kymaResourcesAtom } from 'state/kymaResourcesAtom';

export const clusterAndNsNodesAtom = atom<Promise<NavNode[]>>(async (get) => {
  const resourceList: NavNode[] = get(resourceListAtom);
  const activeNamespaceId = get(activeNamespaceIdAtom);
  const openapiPathIdList = get(openapiPathIdListAtom);
  const permissionSet = await get(permissionSetsAtom);
  const configuration = get(configurationAtom);
  const kymaResources = await get(kymaResourcesAtom);

  const features = configuration?.features || {};

  const areDependenciesInitialized =
    !isEmpty(openapiPathIdList) &&
    !!features &&
    !isEmpty(resourceList) &&
    !isEmpty(permissionSet);

  if (!areDependenciesInitialized) {
    // deps stream in after login, so this flips false several times before load - "not
    // ready", not "no nodes". Resolving [] would rebuild the sidebar mid-load; stay pending.
    return new Promise<NavNode[]>(() => {});
  }

  const configSet = {
    configFeatures: features!,
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
  const navNodesWithAddons = addAdditionalNodes(
    navNodes,
    scope,
    features!,
    !!kymaResources,
  );

  return navNodesWithAddons;
});
clusterAndNsNodesAtom.debugLabel = 'clusterAndNsNodesAtom';
