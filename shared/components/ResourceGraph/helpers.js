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
