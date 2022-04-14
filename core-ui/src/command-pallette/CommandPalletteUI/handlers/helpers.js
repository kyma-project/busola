import didYouMean from 'didyoumean';
import pluralize from 'pluralize';

export function getSuggestion(phrase, itemList) {
  return didYouMean(phrase, itemList);
}

export function toFullResourceType(resourceType, resources) {
  const fullResourceType = resources.find(r => r.aliases.includes(resourceType))
    ?.resourceType;
  return fullResourceType || resourceType;
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
      return resourceTypes
        .flatMap(rT => rT.aliases)
        .filter(alias => alias.startsWith(type));
    case 2: // name
      const resourceNames = resources.map(n => n.metadata.name);
      return resourceNames
        .filter(name => name.startsWith(tokenToAutocomplete))
        .map(name => `${type} ${name} `);
    default:
      return [];
  }
}

export function extractShortNames({
  resourceType: pluralResourceType,
  aliases,
}) {
  const singularResourceType = pluralize(pluralResourceType, 1);
  return aliases.filter(
    alias => alias !== singularResourceType && alias !== pluralResourceType,
  );
}

export function findNavigationNode(resourceType, nodes) {
  return nodes.find(
    n =>
      n.resourceType === resourceType || n.navigationContext === resourceType,
  );
}
