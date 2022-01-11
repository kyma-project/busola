import LuigiClient from '@luigi-project/client';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getSuggestion } from './helpers';

const crdResourceNames = ['customresourcedefinitions', 'crd', 'crds'];

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
  const [type, name] = tokens;
  const suggestedType = getSuggestion(type, crdResourceNames);
  if (name) {
    const crdNames = (resourceCache['customresourcedefinitions'] || []).map(
      n => n.metadata.name,
    );
    const suggestedName = getSuggestion(name, crdNames) || name;
    const suggestion = `${suggestedType || type} ${suggestedName}`;
    if (suggestion !== `${type} ${name}`) {
      return suggestion;
    }
  } else {
    return suggestedType;
  }
}

function makeListItem(item, namespace) {
  const name = item.metadata.name;
  const isNamespaced = item.spec.scope === 'Namespaced';
  return {
    label: `CRD ${name}`,
    category: `${isNamespaced ? 'Namespaced CRDs' : 'Cluster CRDs'}`,
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

function isAboutCRDs({ tokens }) {
  return crdResourceNames.includes(tokens[0]);
}

async function fetchCRDs(context) {
  if (!isAboutCRDs(context)) {
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
  if (!isAboutCRDs(context)) {
    return;
  }

  const { resourceCache, tokens, namespace } = context;
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
      return matchedByName.map(item => makeListItem(item, namespace));
    }
    return null;
  } else {
    const linksToLists = [
      {
        label: 'List of CRDs',
        category: 'Cluster CRDs',
        query: 'crds',
        onActivate: () =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(`/customresourcedefinitions`),
      },
      {
        label: 'List of CRDs',
        category: 'Namespaced CRDs',
        query: 'crds',
        onActivate: () =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(`namespaces/${namespace}/customresourcedefinitions`),
      },
    ];

    return [
      ...linksToLists,
      ...crds.map(item => makeListItem(item, namespace)),
    ];
  }
}

export const crdHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchCRDs,
  createResults,
};
