import { nonResourceHandler } from './nonResourceHandler';
import { clusterResourceHandler } from './clusterResourceHandler';
import { namespacedResourceHandler } from './namespacedResourceHandler';
import { nodesHandler } from './nodesHandler';
import { logsHandler } from './logsHandler';
import { crdHandler } from './crdHandler';
import { helmReleaseHandler } from './helmReleaseHandler';
import { findCommonPrefix } from 'react-shared';
import { crHandler } from './crHandler';

const handlers = [
  nonResourceHandler,
  clusterResourceHandler,
  namespacedResourceHandler,
  nodesHandler,
  logsHandler,
  crdHandler,
  crHandler,
  helmReleaseHandler,
];

export function getSuggestions(context) {
  if (!context.query) {
    return [];
  }
  const suggestions = handlers
    .flatMap(handler => handler.getSuggestions(context))
    .filter(Boolean);

  // don't suggest anything if correct word is already here
  if (suggestions.includes(context.query)) {
    return [];
  }
  return suggestions;
}

export function getAutocompleteEntries(context) {
  if (!context.query) {
    return null;
  }

  const allEntries = handlers
    .flatMap(handler => handler.getAutocompleteEntries(context))
    .filter(Boolean);

  const prefix = findCommonPrefix(context.query, allEntries);
  return prefix === context.query ? null : prefix;
}

export async function fetchResources(context) {
  if (context.activeClusterName) {
    await Promise.all(
      handlers
        .map(handler => handler.fetchResources?.(context))
        .filter(Boolean),
    );
  }
}

export function createResults(context) {
  if (!context.query) {
    return [];
  }
  return handlers
    .flatMap(handler => handler.createResults(context))
    .filter(Boolean);
}

export function getHelpEntries(context) {
  const helpEntries = {
    navigation: handlers
      .map(handler => handler.getNavigationHelp?.(context))
      .filter(Boolean)
      .flatMap(e => e),
    others: handlers
      .map(handler => handler.getOthersHelp?.(context))
      .filter(Boolean)
      .flatMap(e => e),
  };

  helpEntries.navigation.sort((a, b) => a[0].localeCompare(b[0]));
  helpEntries.others.sort((a, b) => a[0].localeCompare(b[0]));
  return helpEntries;
}
