import { Handler, Result } from './../types';
import { CommandPaletteContext } from '../types';
import { getSuggestionForSingleResource } from './helpers';

const customResourcesAliases = ['customresource', 'customresources', 'crs'];

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
    case 3: // name
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
  return customResourcesAliases.some(cra => cra.startsWith(tokens[0]));
}

function createResults(context: CommandPaletteContext): Result[] {
  const { namespace, t, navigate, activeClusterName, query } = context;

  if (!concernsCRDs(context) && query) {
    return [];
  }

  return [
    {
      label: t('command-palette.crs.cluster'),
      category:
        t('configuration.title') +
        ' > ' +
        t('command-palette.crs.cluster-short'),
      query: 'crs',
      onActivate: () => {
        const pathname = `/cluster/${activeClusterName}/customResources`;
        navigate(pathname);
      },
      aliases: ['crs'],
    },
    {
      label: t('command-palette.crs.namespaced'),
      category:
        t('configuration.title') +
        ' > ' +
        t('command-palette.crs.namespaced-short'),
      query: 'crds',
      onActivate: () => {
        const pathname = `/cluster/${activeClusterName}/namespaces/${namespace}/customResources`;
        navigate(pathname);
      },
      aliases: ['crs'],
    },
  ];
}

export const crListHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  createResults,
  getNavigationHelp: () => [{ name: 'customresources', aliases: ['crs'] }],
};
