import didYouMean from 'didyoumean';

export function getSuggestion(phrase, itemList) {
  return didYouMean(phrase, itemList);
}

// assume first item is the full name
export function toFullResourceType(resourceType, resources) {
  return resources.find(r => r.includes(resourceType))?.[0] || resourceType;
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
