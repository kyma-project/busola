import { RecoilValueReadOnly, selector } from 'recoil';
import { partial } from 'lodash';

import { assignNodesToCategories } from './assignToCategories';
import { Category } from './categories';
import { hasCurrentScope } from './filters/hasCurrentScope';
import { NavNode, Scope } from '../types';

import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { externalNodesSelector } from './externalNodesSelector';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { configurationAtom } from '../configuration/configurationAtom';
import { extensionsState } from './extensionsAtom';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';
import { openapiPathIdListSelector } from 'state/openapi/openapiPathIdSelector';
import { permissionSetsSelector } from 'state/permissionSetsSelector';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';

export const sidebarNavigationNodesSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'scopedNavigationSelector',
  get: ({ get }) => {
    const navNodes: NavNode[] = get(clusterAndNsNodesSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const observabilityNodes = get(externalNodesSelector);
    const configuration = get(configurationAtom);
    const features = configuration?.features;
    const openapiPathIdList = get(openapiPathIdListSelector);
    const permissionSet = get(permissionSetsSelector);

    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';
    if (!navNodes || !observabilityNodes) {
      return [];
    }
    let allNodes = [...navNodes, ...observabilityNodes];

    const extResources = get(extensionsState);

    const isExtensibilityOn = features?.EXTENSIBILITY?.isEnabled;
    if (isExtensibilityOn && extResources) {
      const extNavNodes = extResources?.map(ext =>
        mapExtResourceToNavNode(ext),
      );
      allNodes = mergeInExtensibilityNav(allNodes, extNavNodes);
    }

    const nodesFromCurrentScope = partial(hasCurrentScope, scope);
    const filteredNodes = allNodes.filter(nodesFromCurrentScope);

    const configSet = {
      configFeatures: features!,
      openapiPathIdList,
      permissionSet,
    };
    const isNodeVisibleForCurrentConfigSet = partial(
      shouldNodeBeVisible,
      configSet,
    );
    const visibleNodes = filteredNodes.filter(node =>
      isNodeVisibleForCurrentConfigSet(node),
    );

    console.log(filteredNodes?.length, visibleNodes?.length);

    const assignedToCategories: Category[] = assignNodesToCategories(
      visibleNodes,
    );

    return assignedToCategories;
  },
});

export const mergeInExtensibilityNav = (
  nodes: NavNode[],
  extensionNodes: NavNode[],
) => {
  const busolaNodeList = [...nodes];

  extensionNodes.forEach(extNode => {
    if (isLabelAndPathDefined(extNode)) {
      const busolaNodeSameAsExtNodeFn = partial(isTheSameLabelAndPath, extNode);
      const elToBeReplacedIndex = busolaNodeList.findIndex(
        busolaNodeSameAsExtNodeFn,
      );
      replaceOrAddNode(busolaNodeList, extNode, elToBeReplacedIndex);
    }
  });

  return busolaNodeList;
};

const replaceOrAddNode = (
  nodeList: NavNode[],
  node: NavNode,
  index: number,
) => {
  if (index === -1) {
    nodeList.push(node);
  } else {
    nodeList.splice(index, 1, node);
  }
};

const isTheSameLabelAndPath = (
  busolaNode: NavNode,
  extNode: NavNode,
): boolean =>
  busolaNode.label === extNode.label &&
  busolaNode.pathSegment === extNode.pathSegment;

const isLabelAndPathDefined = (node: NavNode) => node.label && node.pathSegment;
