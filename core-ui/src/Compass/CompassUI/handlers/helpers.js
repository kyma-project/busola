import didYouMean from 'didyoumean';

export function getSuggestion(phrase, itemList) {
  return didYouMean(phrase, itemList);
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

// assume first item is the full name
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
    const suggestedName = getSuggestion(name, resourceNames);
    if (suggestedType && suggestedName) {
      return `${suggestedType} ${suggestedName}`;
    }
  } else {
    return suggestedType;
  }
}

export function autocompleteForResources({ tokens, resources, resourceTypes }) {
  const type = tokens[0];
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      // take only first, plural form
      return resourceTypes.flatMap(t => t[0]).filter(rT => rT.startsWith(type));
    case 2: // name
      const resourceNames = resources.map(n => n.metadata.name);
      return resourceNames
        .filter(name => name.startsWith(tokenToAutocomplete))
        .map(name => `${type} ${name} `);
    default:
      return [];
  }
}
