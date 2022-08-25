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
  return (
    busolaNode.label === extNode.label &&
    busolaNode.pathSegment === extNode.pathSegment
  );
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

    const findSameLabelAndPath = partial(findNodeWithSameLabelAndPath, extNode);
    const elementToBeReplacedIndex = busolaNodeList.findIndex(
      findSameLabelAndPath,
    );

    replaceOrAddNode(busolaNodeList, extNode, elementToBeReplacedIndex);
  });

  return busolaNodeList;
};
