import LuigiClient from '@luigi-project/client';
import { getSuggestion } from './helpers';

const nodeResourceNames = ['node', 'nodes', 'no'];

function makeListItem(item) {
  const name = item.metadata.name;
  return {
    label: `Node ${name}`,
    category: 'Cluster Overview',
    onClick: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate('overview/nodes/' + name),
  };
}

async function fetchNodes({ fetch, tokens }) {
  if (!nodeResourceNames.includes(tokens[0])) {
    return null;
  }

  try {
    const response = await fetch('/apis/metrics.k8s.io/v1beta1/nodes');
    const { items } = await response.json();

    if (tokens[1]) {
      const matchedByName = items.filter(item =>
        item.metadata.name.includes(tokens[1]),
      );
      if (matchedByName) {
        return matchedByName.map(item => makeListItem(item));
      }
      return null;
    } else {
      return items.map(item => makeListItem(item));
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function nodesHandler(context) {
  return {
    searchResults: await fetchNodes(context),
    suggestion: getSuggestion(context.tokens[0], nodeResourceNames),
  };
}
