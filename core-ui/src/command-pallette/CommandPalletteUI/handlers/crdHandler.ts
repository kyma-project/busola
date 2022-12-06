import { Result } from './../types';
import LuigiClient from '@luigi-project/client';
import { CommandPaletteContext, Handler, LOADING_INDICATOR } from '../types';
import { getSuggestionsForSingleResource } from './helpers';
import { K8sResource } from 'types';

const crdResourceTypes = ['customresourcedefinitions', 'crd', 'crds'];

function getAutocompleteEntries({
  tokens,
  resourceCache,
}: CommandPaletteContext): string[] {
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      if ('customresourcedefinitions'.startsWith(tokenToAutocomplete)) {
        return ['customresourcedefinitions '];
      } else if ('crds'.startsWith(tokenToAutocomplete)) {
        return ['crds'];
      }
      return [];
    case 2: // name
      const crdNames = (resourceCache['customresourcedefinitions'] || []).map(
        n => n.metadata.name,
      );
      return crdNames
        .filter(name => name.startsWith(tokenToAutocomplete))
        ?.map(name => `${tokens[0]} ${name} `);
    default:
      return [];
  }
}

function getSuggestions({ tokens, resourceCache }: CommandPaletteContext) {
  return getSuggestionsForSingleResource({
    tokens,
    resources: resourceCache['customresourcedefinitions'] || [],
    resourceTypeNames: crdResourceTypes,
  });
}

function makeListItem(item: K8sResource, context: CommandPaletteContext) {
  const { t, activeClusterName, navigate } = context;
  const name = item.metadata.name;

  return {
    label: name,
    category:
      t('configuration.title') + ' > ' + t('custom-resource-definitions.title'),
    query: `crds ${name}`,
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/customresourcedefinitions/${name}`;
      navigate(pathname);
    },
  };
}

function concernsCRDs({ tokens }: CommandPaletteContext) {
  return crdResourceTypes.includes(tokens[0]);
}

async function fetchCRDs(context: CommandPaletteContext) {
  if (!concernsCRDs(context)) {
    return;
  }

  const { fetch, updateResourceCache } = context;
  try {
    const response = await fetch(
      '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
    );
    const { items: crds } = await response.json();
    updateResourceCache('customresourcedefinitions', crds);
  } catch (e) {
    console.warn(e);
  }
}

function createResults(context: CommandPaletteContext): Result[] {
  if (!concernsCRDs(context)) {
    return [];
  }

  const { resourceCache, tokens, t } = context;

  const listLabel = t('command-palette.results.list-of', {
    resourceType: t('command-palette.crds.name-short_plural'),
  });
  const linkToList = {
    label: listLabel,
    category:
      t('configuration.title') + ' > ' + t('custom-resource-definitions.title'),
    query: 'crds',
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(`/customresourcedefinitions`),
  };

  const crds = resourceCache['customresourcedefinitions'];
  if (typeof crds !== 'object') {
    //@ts-ignore  TODO: handle typein Result
    return [linkToList, { type: LOADING_INDICATOR }];
  }

  const name = tokens[1];
  if (name) {
    const matchedByName = crds.filter(item =>
      item.metadata.name.includes(name),
    );
    if (matchedByName) {
      return matchedByName.map(item => makeListItem(item, context));
    }
    return [];
  } else {
    return [linkToList, ...crds.map(item => makeListItem(item, context))];
  }
}

export const crdHandler: Handler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchCRDs,
  createResults,
  getNavigationHelp: () => [
    { name: 'customresourcedefinitions', aliases: ['crds'] },
  ],
};
