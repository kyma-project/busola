export function getApiPath(resourceType, nodes) {
  const matchedNode = nodes.find(
    n =>
      n.resourceType === resourceType || n.navigationContext === resourceType,
  );
  try {
    const url = new URL(matchedNode?.viewUrl);
    return url.searchParams.get('resourceApiPath');
  } catch (e) {
    return null;
  }
}

export function selectorMatches(originalSelector, selector) {
  for (const [key, value] of Object.entries(originalSelector)) {
    if (selector?.[key] !== value) {
      return false;
    }
  }
  return true;
}
