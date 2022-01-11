import LuigiClient from '@luigi-project/client';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getSuggestionsForSingleResource } from './helpers';

const logNames = ['logs', 'log', 'lg'];

function getAutocompleteEntries({ tokens, namespace, resourceCache }) {
  const [type, name] = tokens;
  const tokenToAutocomplete = tokens[tokens.length - 1];
  const pods = resourceCache[`${namespace}/pods`] || [];
  switch (tokens.length) {
    case 1: // type
      if ('pods'.startsWith(tokenToAutocomplete)) {
        return 'pods ';
      }
      break;
    case 2: // pod name
      const podNames = pods.map(n => n.metadata.name);
      return podNames
        .filter(podName => podName.startsWith(tokenToAutocomplete))
        .map(podName => `${type} ${podName} `);
    case 3: // container name
      const pod = pods.find(n => n.metadata.name === name);
      if (!pod) return [];
      return pod.spec.containers
        .map(container => container.name)
        .filter(containerName => containerName.startsWith(tokenToAutocomplete))
        .map(containerName => `${type} ${name} ${containerName}`);
    default:
      return [];
  }
  return [];
}

function getSuggestions({ tokens, resourceCache }) {
  return getSuggestionsForSingleResource({
    tokens,
    resources: resourceCache['pods'] || [],
    resourceTypeNames: logNames,
  });
}

function makeListItem(pod, containerName, t) {
  const podName = pod.metadata.name;
  const namespacePart = `namespaces/${pod.metadata.namespace}`;

  const containers = pod.spec.containers.filter(
    c => !containerName || c.name.includes(containerName),
  );

  return containers.map(({ name: containerName }) => {
    const label = t('compass.results.logs-for', {
      target: `${podName}/${containerName}`,
    });
    const query = `logs ${podName}${containerName ? ` ${containerName}` : ''}`;

    return {
      label,
      category: t('workloads.title'),
      query,
      onActivate: () =>
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(
            `${namespacePart}/pods/details/${podName}/containers/${containerName}`,
          ),
    };
  });
}

// todo wtf naming
function isAboutLogs({ tokens }) {
  return logNames.includes(tokens[0]);
}

async function fetchLogs(context) {
  if (!isAboutLogs(context)) {
    return;
  }

  const { fetch, updateResourceCache, namespace } = context;
  try {
    const response = await fetch(`/api/v1/namespaces/${namespace}/pods`);
    const { items: pods } = await response.json();
    updateResourceCache(`${namespace}/pods`, pods);
  } catch (e) {
    console.warn(e);
  }
}

function createResults(context) {
  if (!isAboutLogs(context)) {
    return;
  }

  const { resourceCache, tokens, namespace, t } = context;
  const pods = resourceCache[`${namespace}/pods`];
  if (typeof pods !== 'object') {
    return LOADING_INDICATOR;
  }

  const podName = tokens[1];
  const containerName = tokens[2];
  if (podName) {
    const matchedByPodName = pods.filter(pod =>
      pod.metadata.name.includes(podName),
    );
    if (matchedByPodName) {
      return matchedByPodName.flatMap(pod =>
        makeListItem(pod, containerName, t),
      );
    }
    return null;
  } else {
    return pods.flatMap(pod => makeListItem(pod, containerName, t));
  }
}

export const logsHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchLogs,
  createResults,
};
