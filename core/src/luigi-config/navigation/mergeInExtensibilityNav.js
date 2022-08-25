import { partial } from 'lodash';

const isNodeASwapCandidate = node => {
  if (!node.label || !node.pathSegment) {
    return true;
  }
};

const findNodeWithSameLabelAndPath = (busolaNode, extNode) => {
  if (isNodeASwapCandidate(busolaNode)) {
    return false;
  }
  const extHasSameLabel = busolaNode.label === extNode.label;
  const extHasSamePath = busolaNode.pathSegment === extNode.pathSegment;
  return extHasSameLabel && extHasSamePath;
};

const replaceOrAddNode = (nodeList, node, index) => {
  if (index > -1) {
    nodeList.splice(index, 1, node);
  } else {
    nodeList.push(node);
  }
};

export const mergeInExtensibilityNav = (nodes, extensionNodes) => {
  const busolaNodeList = [...nodes];

  extensionNodes.forEach(extNode => {
    if (isNodeASwapCandidate(extNode)) {
      return;
    }

    const sameLabelAndPath = partial(findNodeWithSameLabelAndPath, extNode);
    const replaceElementIndex = busolaNodeList.findIndex(sameLabelAndPath);

    replaceOrAddNode(busolaNodeList, extNode, replaceElementIndex);
  });

  return busolaNodeList;
};
