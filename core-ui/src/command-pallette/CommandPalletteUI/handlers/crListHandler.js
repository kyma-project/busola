import LuigiClient from '@luigi-project/client';
import { getSuggestionsForSingleResource } from './helpers';

function getAutocompleteEntries({ tokens, resourceCache }) {
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      if ('customresources'.startsWith(tokenToAutocomplete)) {
        return 'customresources ';
      }
      break;
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

function getSuggestions({ tokens, resourceCache }) {
  return getSuggestionsForSingleResource({
    tokens,
    resources: resourceCache['customresources'] || [],
    resourceTypeNames: ['customresources'],
  });
}

function concernsCRDs({ tokens }) {
  return tokens[0] === 'customresource' || tokens[0] === 'customresources';
}

function createResults(context) {
  if (!concernsCRDs(context)) {
    return;
  }

  const { namespace, t } = context;

  const listLabel = t('command-palette.results.list-of', {
    resourceType: t('command-palette.crs.name-short_plural'),
  });

  return [
    {
      label: listLabel,
      category:
        t('configuration.title') + ' > ' + t('command-palette.crs.cluster'),
      query: 'crs',
      onActivate: () =>
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(`/customresources`),
    },
    {
      label: listLabel,
      category:
        t('configuration.title') + ' > ' + t('command-palette.crs.namespaced'),
      query: 'crds',
      onActivate: () =>
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(`namespaces/${namespace}/customresources`),
    },
  ];
}

export const crListHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: () => {},
  createResults,
  getNavigationHelp: () => [['customresources', ['crs']]],
};
