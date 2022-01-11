import didYouMean from 'didyoumean';
import { prettifyNameSingular, prettifyNamePlural } from 'react-shared';

export function getSuggestion(phrase, itemList) {
  const suggestion = didYouMean(phrase, itemList);
  if (suggestion !== phrase) {
    return suggestion;
  }
  return null;
}

export function getApiPath(resourceType, nodes) {
  const matchedNode = nodes.find(n => n.resourceType === resourceType);
  try {
    const url = new URL(matchedNode?.viewUrl);
    return url.searchParams.get('resourceApiPath');
  } catch (e) {
    return null;
  }
}

export function formatTypePlural(viewUrl) {
  return formatFromViewUrl(viewUrl, prettifyNamePlural);
}

export function formatTypeSingular(viewUrl) {
  return formatFromViewUrl(viewUrl, prettifyNameSingular);
}

function formatFromViewUrl(viewUrl, formatter) {
  const { pathname } = new URL(viewUrl);
  const resourceType = pathname.substring(pathname.lastIndexOf('/') + 1);
  return formatter(null, resourceType);
}

// assume first item is full name
export function toFullResourceType(resourceType, resources) {
  return resources.find(r => r.includes(resourceType))?.[0] || resourceType;
}

export function findCommonPrefix(initialPrefix, words) {
  if (!words || words?.length < 1) {
    return initialPrefix;
  }

  words.sort();
  const first = words[0];
  const last = words[words.length - 1];
  let biggestCommonPrefix = initialPrefix;
  while (
    first[biggestCommonPrefix.length] &&
    first[biggestCommonPrefix.length] === last[biggestCommonPrefix.length]
  ) {
    biggestCommonPrefix += first[biggestCommonPrefix.length];
  }

  return biggestCommonPrefix;
}

export function getSuggestionsForSingleResource({
  tokens,
  resources,
  resourceTypeNames,
}) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(type, resourceTypeNames);
  if (name) {
    const resourceNames = resources.map(n => n.metadata.name);
    const suggestedName = getSuggestion(name, resourceNames) || name;
    const suggestion = `${suggestedType || type} ${suggestedName}`;
    if (suggestion !== `${type} ${name}`) {
      return suggestion;
    }
  } else {
    return suggestedType;
  }
}
