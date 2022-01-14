import LuigiClient from '@luigi-project/client';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getSuggestionsForSingleResource } from './helpers';

const crdResourceTypes = ['customresourcedefinitions', 'crd', 'crds'];

function getAutocompleteEntries({ tokens, resourceCache }) {
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      if ('customresourcedefinitions'.startsWith(tokenToAutocomplete)) {
        return 'customresourcedefinitions ';
      } else if ('crds'.startsWith(tokenToAutocomplete)) {
        return 'crds';
      }
      break;
    case 2: // name
      const crdNames = (resourceCache['customresourcedefinitions'] || []).map(
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
    resources: resourceCache['customresourcedefinitions'] || [],
    resourceTypeNames: crdResourceTypes,
  });
}

function makeListItem(item, namespace, t) {
  const name = item.metadata.name;
  const isNamespaced = item.spec.scope === 'Namespaced';

  return {
    label: name,
    category:
      t('configuration.title') +
      ' > ' +
      (isNamespaced ? t('compass.crds.namespaced') : t('compass.crds.cluster')),
    query: `crds ${name}`,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(
          (isNamespaced ? `/namespaces/${namespace}` : '') +
            `/customresourcedefinitions/details/${name}`,
        ),
  };
}

function concertnsCRDs({ tokens }) {
  return crdResourceTypes.includes(tokens[0]);
}

async function fetchCRDs(context) {
  if (!concertnsCRDs(context)) {
    return;
  }

  const { fetch, updateResourceCache } = context;
  try {
    const response = await fetch(
      '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
    );
    const { items: nodes } = await response.json();
    updateResourceCache('customresourcedefinitions', nodes);
  } catch (e) {
    console.warn(e);
  }
}

function createResults(context) {
  if (!concertnsCRDs(context)) {
    return;
  }

  const { resourceCache, tokens, namespace, t } = context;
  const crds = resourceCache['customresourcedefinitions'];
  if (typeof crds !== 'object') {
    return LOADING_INDICATOR;
  }

  const name = tokens[1];
  if (name) {
    const matchedByName = crds.filter(item =>
      item.metadata.name.includes(name),
    );
    if (matchedByName) {
      return matchedByName.map(item => makeListItem(item, namespace, t));
    }
    return null;
  } else {
    const listLabel = t('compass.results.list-of', {
      resourceType: t('compass.crds.name-short_plural'),
    });

    const linksToLists = [
      {
        label: listLabel,
        category: t('configuration.title') + ' > ' + t('compass.crds.cluster'),
        query: 'crds',
        onActivate: () =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(`/customresourcedefinitions`),
      },
      {
        label: listLabel,
        category:
          t('configuration.title') + ' > ' + t('compass.crds.namespaced'),
        query: 'crds',
        onActivate: () =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(`namespaces/${namespace}/customresourcedefinitions`),
      },
    ];

    return [
      ...linksToLists,
      ...crds.map(item => makeListItem(item, namespace, t)),
    ];
  }
}

export const crdHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchCRDs,
  createResults,
  getNavigationHelp: () => [['customresourcedefinitions', 'crds']],
};
