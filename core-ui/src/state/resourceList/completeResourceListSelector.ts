import { selector } from 'recoil';
import { extResourcesState } from '../extResourcesAtom';
import { resources } from 'resources';
import { isEmpty, partial } from 'lodash';
import { NavNode } from '../types';
import { configFeaturesState } from '../configFeaturesAtom';
import { busolaResourcesToNavNodes } from './busolaResourcesToNavNodes';
import { extResourcesToNavNodes } from './extResourcesToNavNodes';

type ResourceList = NavNode[];

export const completeResourceListSelector = selector<ResourceList>({
  key: 'completeResourceListSelector',
  get: ({ get }) => {
    const extResources = get(extResourcesState);
    const features = get(configFeaturesState);
    if (isEmpty(features)) return [];
    const isExtensibilityOn = features.EXTENSIBILITY?.isEnabled;
    const isExtensionsLoaded = extResources?.length;

    const busolaResourceNodeList = resources.map(busolaResourcesToNavNodes);

    //TODO Add manually
    // missing on NS
    // custom resources
    // helm releases
    // cluster overview
    // back to cluster details
    // missing on cluster
    // custom resources
    // extensions
    // cluster details

    if (!isExtensibilityOn) {
      return busolaResourceNodeList;
    }

    if (isExtensibilityOn && isExtensionsLoaded) {
      const extResourceNodeList = extResources.map(extResourcesToNavNodes);

      const mergedNodeList = mergeInExtensibilityNav(
        busolaResourceNodeList,
        extResourceNodeList,
      );
      return mergedNodeList;
    }
    return [];
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
