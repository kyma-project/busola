import { nonResourceHandler } from './nonResourceHandler';
import { clusterResourceHandler } from './clusterResourceHandler';
import { namespacedResourceHandler } from './namespacedResourceHandler';
import { nodesHandler } from './nodesHandler';
import { logsHandler } from './logsHandler';
import { crdHandler } from './crdHandler';
import { findCommonPrefix } from './helpers';

const handlers = [
  nonResourceHandler,
  clusterResourceHandler,
  namespacedResourceHandler,
  nodesHandler,
  logsHandler,
  crdHandler,
];

export function getSuggestions(context) {
  if (!context.search) {
    return [];
  }
  const suggestions = handlers
    .flatMap(handler => handler.getSuggestions(context))
    .filter(Boolean);

  // don't suggest anything if correct word is already here
  if (suggestions.includes(context.search)) {
    return [];
  }
  return suggestions;
}

export function getAutocompleteEntries(context) {
  if (!context.search) {
    return null;
  }

  const allEntries = handlers
    .flatMap(handler => handler.getAutocompleteEntries(context))
    .filter(Boolean);

  const prefix = findCommonPrefix(context.search, allEntries);
  return prefix === context.search ? null : prefix;
}

export async function fetchResources(context) {
  if (context.activeClusterName) {
    await Promise.all(handlers.map(handler => handler.fetchResources(context)));
  }
}

export function createResults(context) {
  if (!context.search) {
    return [];
  }
  return handlers
    .flatMap(handler => handler.createResults(context))
    .filter(Boolean);
}
