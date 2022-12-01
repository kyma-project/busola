import { RecoilValueReadOnly, selector } from 'recoil';
import { partial } from 'lodash';

import { assignNodesToCategories } from './assignToCategories';
import { Category } from './categories';
import { hasCurrentScope } from './filters/hasCurrentScope';
import { NavNode, Scope } from '../types';

import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { externalNodesSelector } from './externalNodesSelector';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { configurationState } from '../configurationSelector';
import { extensibilityNodesState } from '../navigation/extensibilityNodesSelector';

export const sidebarNavigationNodesSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'scopedNavigationSelector',
  get: ({ get }) => {
    const navNodes: NavNode[] = get(clusterAndNsNodesSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const observabilityNodes = get(externalNodesSelector);
    const configuration = get(configurationState);
    const features = configuration?.features;

    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';
    if (!navNodes || !observabilityNodes) {
      return [];
    }
    let allNodes = [...navNodes, ...observabilityNodes];

    const extResources = get(extensibilityNodesState);
    const isExtensibilityOn = features?.EXTENSIBILITY?.isEnabled;
    if (isExtensibilityOn && extResources) {
      allNodes = mergeInExtensibilityNav(allNodes, extResources);
    }

    const nodesFromCurrentScope = partial(hasCurrentScope, scope);
    const filteredNodes = allNodes.filter(nodesFromCurrentScope);
    const assignedToCategories: Category[] = assignNodesToCategories(
      filteredNodes,
    );

    return assignedToCategories;
  },
});

const mergeInExtensibilityNav = (
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
