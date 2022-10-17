import { selector } from 'recoil';
import { extResourcesState } from '../extResourcesAtom';
import { resources } from 'resources';
import { partial } from 'lodash';
import { NavNode } from '../types';
import { configFeaturesState } from '../configFeaturesAtom';
import { busolaResourcesToNavNodes } from './busolaResourcesToNavNodes';
import { extResourcesToNavNodes } from './extResourcesToNavNodes';

export const completeResourceListSelector = selector({
  key: 'completeResourceListSelector',
  get: ({ get }) => {
    const extResources = get(extResourcesState);
    const features = get(configFeaturesState);

    const isExtensibilityOn = features.EXTENSIBILITY?.isEnabled;
    const isExtensionsLoaded = extResources?.length;

    const busolaResourceNodeList = resources.map(busolaResourcesToNavNodes);

    if (!isExtensibilityOn) {
      return busolaResourceNodeList;
    }

    if (isExtensibilityOn && isExtensionsLoaded) {
      const extResourceNodeList = extResources.map(extResourcesToNavNodes);

      const merged = mergeInExtensibilityNav(
        busolaResourceNodeList,
        extResourceNodeList,
      );

      return merged;
    }
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
