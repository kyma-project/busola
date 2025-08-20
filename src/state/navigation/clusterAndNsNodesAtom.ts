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
import { moduleTemplatesCountAtom } from 'state/moduleTemplatesCountAtom';

export const clusterAndNsNodesAtom = atom<Promise<NavNode[]>>(async get => {
  const resourceList: NavNode[] = get(resourceListAtom);
  const activeNamespaceId = get(activeNamespaceIdAtom);
  const openapiPathIdList = get(openapiPathIdListAtom);
  const permissionSet = await get(permissionSetsAtom);
  const configuration = get(configurationAtom);
  const moduleTemplatesCount = await get(moduleTemplatesCountAtom);

  const features = configuration?.features || {};

  const areDependenciesInitialized =
    !isEmpty(openapiPathIdList) &&
    !!features &&
    !isEmpty(resourceList) &&
    !isEmpty(permissionSet);

  if (!areDependenciesInitialized) {
    return [];
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
    moduleTemplatesCount,
  );

  return navNodesWithAddons;
});
clusterAndNsNodesAtom.debugLabel = 'clusterAndNsNodesAtom';
