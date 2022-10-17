import { selector } from 'recoil';
import { extResourcesState } from './extResourcesState';
import { resources } from 'resources';
import { partial } from 'lodash';
import { ExtResource, NavNode } from './types';
import { configFeaturesState } from './configFeaturesAtom';

export const completeResourceListSelector = selector({
  key: 'CurrentUserName',
  get: ({ get }) => {
    const extResources = get(extResourcesState);
    const features = get(configFeaturesState);

    const isExtensibilityOn = features.EXTENSIBILITY?.isEnabled;
    const isExtenstionsLoaded = extResources.length;

    const busolaResourceNodeList = resources.map(
      (resource: Partial<NavNode> & Pick<NavNode, 'resourceType'>) => {
        const node: NavNode = {} as NavNode;

        node.category = resource.category || 'temporary';
        node.resourceType = resource.resourceType.toLowerCase();
        node.pathSegment = (
          resource.pathSegment || resource.resourceType
        ).toLowerCase();
        node.label = resource.label || resource.resourceType;
        node.namespaced = !!resource.namespaced;

        return node;
      },
    );

    if (!isExtensibilityOn) {
      return busolaResourceNodeList;
    }

    if (isExtensibilityOn && isExtenstionsLoaded) {
      const extResourceNodeList = extResources.map((extRes: ExtResource) => {
        const node: NavNode = {} as NavNode;

        node.category = extRes.general.category;
        node.resourceType = extRes.general.resource.kind.toLowerCase();
        node.pathSegment =
          extRes.general.urlPath || extRes.general.resource.kind.toLowerCase();
        node.label = extRes.general.name || node.resourceType;
        node.namespaced = extRes.general.scope === 'namespace';

        return node;
      });
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
