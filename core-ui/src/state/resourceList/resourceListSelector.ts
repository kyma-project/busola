import { selector } from 'recoil';
import { extResourcesState } from '../extResourcesAtom';
import { resources } from 'resources';
import { partial } from 'lodash';
import { NavNode } from '../types';
import { configFeaturesState } from '../configFeaturesAtom';
import { busolaResourcesToNavNodes } from './busolaResourcesToNavNodes';
import { extResourcesToNavNodes } from './extResourcesToNavNodes';

//TODO Add manually
// // missing on NS
// custom resources
// helm releases
// cluster overview
// back to cluster details
// // missing on cluster
// custom resources
// extensions
// cluster details

type ResourceList = NavNode[];

export const resourceListSelector = selector<ResourceList>({
  key: 'resourceListSelector',
  get: ({ get }) => {
    const configFeatures = get(configFeaturesState);
    const extResources = get(extResourcesState);

    let resNodeList: ResourceList = [];

    if (!configFeatures) return resNodeList;

    const isExtensibilityOn = configFeatures.EXTENSIBILITY?.isEnabled;
    const areExtensionsLoaded = isExtensibilityOn && extResources;
    if (areExtensionsLoaded) {
      const extNodeList = extResources.map(extResourcesToNavNodes);
      resNodeList = mergeInExtensibilityNav(resNodeList, extNodeList);
    }

    if (!isExtensibilityOn) {
      resNodeList = resources.map(busolaResourcesToNavNodes);
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
