// import { nonResourceHandler } from './nonResourceHandler';
// import { clusterResourceHandler } from './clusterResourceHandler';
// import { namespacedResourceHandler } from './namespacedResourceHandler';
// import { nodesHandler } from './nodesHandler';
// import { logsHandler } from './logsHandler';
// import { crdHandler } from './crdHandler';
// import { helmReleaseHandler } from './helmReleaseHandler';
import { findCommonPrefix } from 'shared/utils/helpers';
// import { crHandler } from './crHandler';
import { crListHandler } from './crListHandler';
import { CommandPaletteContext, Handler, HelpEntries, Result } from '../types';

const allHandlers: Handler[] = [
  // nonResourceHandler,
  // clusterResourceHandler,
  // // namespacedResourceHandler,
  // nodesHandler,
  // logsHandler,
  // crdHandler,
  crListHandler,
  // crHandler,
  // helmReleaseHandler,
];

export function getSuggestions(context: CommandPaletteContext): string[] {
  if (!context.query) {
    return [];
  }
  const suggestions = allHandlers
    .map(handler => handler.getSuggestion(context))
    .filter(Boolean) as string[];

  // don't suggest anything if correct word is already here
  if (suggestions.includes(context.query)) {
    return [];
  }
  return suggestions;
}

export function getAutocompleteEntries(
  context: CommandPaletteContext,
): string | null {
  if (!context.query) {
    return null;
  }

  const allEntries = allHandlers
    .flatMap(handler => handler.getAutocompleteEntries(context))
    .filter(Boolean);

  // don't try to autocomplete if correct word is already here
  if (allEntries.includes(context.query)) {
    return null;
  }

  const prefix = findCommonPrefix(context.query, allEntries);
  return prefix === context.query ? null : prefix;
}

export async function fetchResources(
  context: CommandPaletteContext,
): Promise<void> {
  if (context.activeClusterName) {
    await Promise.all(
      allHandlers
        .map(handler => handler.fetchResources?.(context))
        .filter(Boolean),
    );
  }
}

export function createResults(context: CommandPaletteContext): Result[] {
  if (!context.query) {
    return [];
  }
  return allHandlers
    .flatMap(handler => handler.createResults(context))
    .filter(h => h !== null) as Result[];
}

export function getHelpEntries(context: CommandPaletteContext): HelpEntries {
  const helpEntries: HelpEntries = {
    navigation: allHandlers
      .map(handler => handler.getNavigationHelp?.(context) || [])
      .filter(Boolean)
      .flatMap(e => e),
    others: allHandlers
      .map(handler => handler.getOthersHelp?.(context) || [])
      .filter(Boolean)
      .flatMap(e => e),
    crds: allHandlers
      .map(handler => handler.getCRsHelp?.(context) || [])
      .filter(Boolean)
      .flatMap(e => e),
  };

  helpEntries.navigation.sort((a, b) => a.name.localeCompare(b.name));
  helpEntries.others.sort((a, b) => a.name[0].localeCompare(b.name));
  return helpEntries;
}
