import _ from 'lodash';

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

export function wrap(str) {
  return _.chunk(str.split(''), 15)
    .map(s => s.join(''))
    .join('\n');
}
