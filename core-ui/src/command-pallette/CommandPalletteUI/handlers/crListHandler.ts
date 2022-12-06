import { Handler, Result } from './../types';
import { CommandPaletteContext } from '../types';
import { getSuggestionForSingleResource } from './helpers';

function getAutocompleteEntries({
  tokens,
  resourceCache,
}: CommandPaletteContext): string[] {
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      if ('customresources'.startsWith(tokenToAutocomplete)) {
        return ['customresources '];
      }
      return [];
    case 2: // name
      const crdNames = (resourceCache['customresources'] || []).map(
        n => n.metadata.name,
      );
      return crdNames
        .filter(name => name.startsWith(tokenToAutocomplete))
        .map(name => `${tokens[0]} ${name} `);
    default:
      return [];
  }
}

function getSuggestion({ tokens, resourceCache }: CommandPaletteContext) {
  return getSuggestionForSingleResource({
    tokens,
    resources: resourceCache['customresources'] || [],
    resourceTypeNames: ['customresources'],
  });
}

function concernsCRDs({ tokens }: CommandPaletteContext) {
  return tokens[0] === 'customresource' || tokens[0] === 'customresources';
}

function createResults(context: CommandPaletteContext): Result[] {
  if (!concernsCRDs(context)) {
    return [];
  }

  const { namespace, t, navigate, activeClusterName } = context;

  const listLabel = t('command-palette.results.list-of', {
    resourceType: t('command-palette.crs.name-short_plural'),
  });

  return [
    {
      label: listLabel,
      category:
        t('configuration.title') + ' > ' + t('command-palette.crs.cluster'),
      query: 'crs',
      onActivate: () => {
        const pathname = `/cluster/${activeClusterName}/customResources`;
        navigate(pathname);
      },
    },
    {
      label: listLabel,
      category:
        t('configuration.title') + ' > ' + t('command-palette.crs.namespaced'),
      query: 'crds',
      onActivate: () => {
        const pathname = `/cluster/${activeClusterName}/namespaces/${namespace}/customResources`;
        navigate(pathname);
      },
    },
  ];
}

export const crListHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  createResults,
  getNavigationHelp: () => [{ name: 'customresources', aliases: ['crs'] }],
};
