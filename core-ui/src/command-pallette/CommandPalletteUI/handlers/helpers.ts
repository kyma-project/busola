import { ResourceTypeWithAliases } from './../../../shared/constants';
import didYouMean from 'didyoumean';
import pluralize from 'pluralize';
import { K8sResource } from 'types';
import { NavNode } from 'state/types';

export function makeSuggestion(phrase: string, itemList: string[]): string {
  const suggestions = didYouMean(phrase, itemList);
  return Array.isArray(suggestions) ? suggestions[0] : suggestions;
}

export function toFullResourceType(
  resourceType: string,
  resources: ResourceTypeWithAliases[],
) {
  const fullResourceType = resources.find(r => r.aliases.includes(resourceType))
    ?.resourceType;
  return fullResourceType || resourceType;
}

export function getSuggestionForSingleResource({
  tokens,
  resources,
  resourceTypeNames,
}: {
  tokens: string[];
  resources: K8sResource[];
  resourceTypeNames: string[];
}) {
  const [type, name] = tokens;
  const suggestedType = makeSuggestion(type, resourceTypeNames);
  if (name) {
    const resourceNames = resources.map(n => n.metadata.name);
    const suggestedName = makeSuggestion(name, resourceNames);
    if (suggestedType && suggestedName) {
      return `${suggestedType} ${suggestedName}`;
    }
  } else {
    return suggestedType;
  }
}

export function autocompleteForResources({
  tokens,
  resources,
  resourceTypes,
}: {
  tokens: string[];
  resources: K8sResource[];
  resourceTypes: ResourceTypeWithAliases[];
}): string[] {
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
}: {
  resourceType: string;
  aliases: string[];
}): string[] {
  const singularResourceType = pluralize(pluralResourceType, 1);
  return aliases.filter(
    alias => alias !== singularResourceType && alias !== pluralResourceType,
  );
}

export function findNavigationNode(resourceType: string, navNodes: NavNode[]) {
  return navNodes.find(
    n => pluralize(n.resourceType) === pluralize(resourceType),
  );
}

export function getApiPathForQuery(
  tokens: string[],
  nodes: NavNode[],
  availableResourceTypes: ResourceTypeWithAliases[],
) {
  const resourceType = toFullResourceType(tokens[0], availableResourceTypes);
  const navNode = findNavigationNode(resourceType, nodes);

  if (!navNode) return null;

  if (navNode.apiGroup) {
    return `/apis/${navNode.apiGroup}/${navNode.apiVersion}`;
  } else {
    return `/api/${navNode.apiVersion}`;
  }
}
