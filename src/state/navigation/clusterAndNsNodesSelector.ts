import { atom, useAtomValue } from 'jotai';
import { isEmpty, partial } from 'lodash';
import { resourceListState } from '../resourceList/resourceListAtom';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configurationState } from '../configuration/configurationAtom';
import { permissionSetsSelector } from '../permissionSetsSelector';
import { NavNode, Scope } from '../types';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';
import { addAdditionalNodes } from './addAdditionalNodes';
import { moduleTemplatesCountSelector } from 'state/moduleTemplatesCountSelector';

export const clusterAndNsNodesSelector = atom<Promise<NavNode[]>>(async get => {
  const resourceList: NavNode[] = useAtomValue(resourceListState);
  const activeNamespaceId = get(activeNamespaceIdState);
  const openapiPathIdList = get(openapiPathIdListSelector);
  const permissionSet = get(permissionSetsSelector);
  const configuration = get(configurationState);
  const moduleTemplatesCount = get(moduleTemplatesCountSelector);

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

clusterAndNsNodesSelector.debugLabel = 'clusterAndNsNodesSelector';
