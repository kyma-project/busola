export const mergeInExtensibilityNav = (nodes, extensionNodes) => {
  const busolaNavigationNodes = [...nodes];

  extensionNodes.forEach(node => {
    if (!node.label || !node.pathSegment) {
      return;
    }

    const indexOfNodeToRemove = busolaNavigationNodes.findIndex(nativeNode => {
      if (!nativeNode.label || !nativeNode.pathSegment) {
        return false;
      }
      const extensionHasSameLabel = nativeNode.label === node.label;
      const extensionHasSamePath = nativeNode.pathSegment === node.pathSegment;
      return extensionHasSameLabel && extensionHasSamePath;
    });
    if (indexOfNodeToRemove > -1) {
      busolaNavigationNodes.splice(indexOfNodeToRemove, 1, node);
    } else {
      busolaNavigationNodes.push(node);
    }
  });

  return busolaNavigationNodes;
};
