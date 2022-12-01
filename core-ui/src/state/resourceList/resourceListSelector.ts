import { selector } from 'recoil';
import { extensibilityNodesState } from '../navigation/extensibilityNodesSelector';
import { resources } from 'resources';
import { partial } from 'lodash';
import { NavNode } from '../types';
import { configurationState } from '../configurationSelector';
import { mapBusolaResourceToNavNode } from './mapBusolaResourceToNavNode';

export const resourceListSelector = selector<NavNode[]>({
  key: 'resourceListSelector',
  get: ({ get }) => {
    const configuration = get(configurationState);
    const features = configuration?.features;

    let resNodeList: NavNode[] = [];

    if (!features) {
      return resNodeList;
    }

    resNodeList = resources.map(mapBusolaResourceToNavNode);

    const extResources = get(extensibilityNodesState);
    const isExtensibilityOn = features.EXTENSIBILITY?.isEnabled;
    if (isExtensibilityOn && extResources) {
      resNodeList = mergeInExtensibilityNav(resNodeList, extResources);
    }
    return resNodeList;
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
