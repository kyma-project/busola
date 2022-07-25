import LuigiClient from '@luigi-project/client';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getSuggestionsForSingleResource } from './helpers';

const nodeResourceTypes = ['nodes', 'node', 'no'];

function getAutocompleteEntries({ tokens, resourceCache }) {
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      if ('nodes'.startsWith(tokenToAutocomplete)) {
        return 'nodes ';
      }
      break;
    case 2: // name
      const nodeNames = (resourceCache['nodes'] || []).map(
        n => n.metadata.name,
      );
      return nodeNames
        .filter(name => name.startsWith(tokenToAutocomplete))
        .map(nodeName => `${tokens[0]} ${nodeName} `);
    default:
      return [];
  }
}

function getSuggestions({ tokens, resourceCache }) {
  return getSuggestionsForSingleResource({
    tokens,
    resources: resourceCache['nodes'] || [],
    resourceTypeNames: nodeResourceTypes,
  });
}

function makeListItem(item, t) {
  const name = item.metadata.name;
  return {
    label: name,
    category:
      t('clusters.overview.title-current-cluster') + ' > ' + t('nodes.title'),
    query: `node ${name}`,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate('overview/nodes/' + name),
  };
}

function isAboutNodes({ tokens }) {
  return nodeResourceTypes.includes(tokens[0]);
}

async function concernsNodes(context) {
  if (!isAboutNodes(context)) {
    return;
  }

  const { fetch, updateResourceCache } = context;
  try {
    const response = await fetch('/apis/metrics.k8s.io/v1beta1/nodes');
    const { items: nodes } = await response.json();
    updateResourceCache('nodes', nodes);
  } catch (e) {
    console.warn(e);
  }
}

function createResults(context) {
  if (!isAboutNodes(context)) {
    return;
  }

  const { resourceCache, tokens, t } = context;
  const nodes = resourceCache['nodes'];
  if (typeof nodes !== 'object') {
    return [{ type: LOADING_INDICATOR }];
  }

  const name = tokens[1];
  if (name) {
    const matchedByName = nodes.filter(item =>
      item.metadata.name.includes(name),
    );
    if (matchedByName) {
      return matchedByName.map(item => makeListItem(item, t));
    }
    return null;
  } else {
    return nodes.map(item => makeListItem(item, t));
  }
}

export const nodesHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: concernsNodes,
  createResults,
  getNavigationHelp: () => [['nodes', ['no']]],
};
