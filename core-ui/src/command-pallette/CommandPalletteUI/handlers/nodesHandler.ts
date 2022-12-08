import { K8sResource } from 'types';
import {
  CommandPaletteContext,
  Handler,
  LOADING_INDICATOR,
  Result,
} from '../types';
import { getSuggestionForSingleResource } from './helpers';

const nodeResourceTypes = ['nodes', 'node', 'no'];

function getAutocompleteEntries(
  context: CommandPaletteContext,
): string[] | null {
  const { tokens, resourceCache } = context;
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      if ('nodes'.startsWith(tokenToAutocomplete)) {
        return ['nodes '];
      }
      return null;
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

function getSuggestion(context: CommandPaletteContext) {
  const { tokens, resourceCache } = context;
  return getSuggestionForSingleResource({
    tokens,
    resources: resourceCache['nodes'] || [],
    resourceTypeNames: nodeResourceTypes,
  });
}

function makeListItem(
  item: K8sResource,
  context: CommandPaletteContext,
): Result {
  const { t, navigate, activeClusterName } = context;
  const name = item.metadata.name;
  return {
    label: name,
    category:
      t('clusters.overview.title-current-cluster') + ' > ' + t('nodes.title'),
    query: `node ${name}`,
    onActivate: () =>
      navigate(`/cluster/${activeClusterName}/overview/nodes/${name}`),
  };
}

function isAboutNodes({ tokens }: { tokens: string[] }) {
  return nodeResourceTypes.includes(tokens[0]);
}

async function concernsNodes(context: CommandPaletteContext) {
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

function createResults(context: CommandPaletteContext): Result[] | null {
  if (!isAboutNodes(context)) {
    return null;
  }

  const { resourceCache, tokens } = context;
  const nodes = resourceCache['nodes'];
  if (typeof nodes !== 'object') {
    return [
      { type: LOADING_INDICATOR, label: '', query: '', onActivate: () => {} },
    ];
  }

  const name = tokens[1];
  if (name) {
    const matchedByName = nodes.filter(item =>
      item.metadata.name.includes(name),
    );
    if (matchedByName) {
      return matchedByName.map(item => makeListItem(item, context));
    }
    return null;
  } else {
    return nodes.map(item => makeListItem(item, context));
  }
}

export const nodesHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  fetchResources: concernsNodes,
  createResults,
  getNavigationHelp: () => [{ name: 'nodes', aliases: ['no'] }],
};
