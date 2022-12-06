import { Result } from './../types';
import { Pod } from 'types';
import { CommandPaletteContext, Handler, LOADING_INDICATOR } from '../types';
import { getSuggestionForSingleResource } from './helpers';

const logNames = ['logs', 'log', 'lg'];

function getAutocompleteEntries({
  tokens,
  namespace,
  resourceCache,
}: CommandPaletteContext) {
  const [type, name] = tokens;
  const tokenToAutocomplete = tokens[tokens.length - 1];
  const pods = (resourceCache[`${namespace}/pods`] || []) as Pod[];

  switch (tokens.length) {
    case 1: // type
      if ('pods'.startsWith(tokenToAutocomplete)) {
        return ['pods '];
      }
      return [];
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
}

function getSuggestion({ tokens, resourceCache }: CommandPaletteContext) {
  return getSuggestionForSingleResource({
    tokens,
    resources: resourceCache['pods'] || [],
    resourceTypeNames: logNames,
  });
}

function makeListItem(
  pod: Pod,
  containerName: string,
  context: CommandPaletteContext,
) {
  const podName = pod.metadata.name;
  const { t, activeClusterName, navigate } = context;
  const namespacePart = `namespaces/${pod.metadata.namespace}`;

  const containers = pod.spec.containers.filter(
    c => !containerName || c.name.includes(containerName),
  );

  return containers.map(({ name: containerName }) => {
    const label = t('command-palette.results.logs-for', {
      target: `${podName}/${containerName}`,
    });
    const query = `logs ${podName}${containerName ? ` ${containerName}` : ''}`;

    return {
      label,
      category: t('workloads.title') + ' > ' + t('pods.title'),
      query,
      onActivate: () => {
        const pathname = `/cluster/${activeClusterName}/${namespacePart}/pods/${podName}/containers/${containerName}`;
        navigate(pathname);
      },
    };
  });
}

function concernsLogs({ tokens }: CommandPaletteContext) {
  return logNames.includes(tokens[0]);
}

async function fetchLogs(context: CommandPaletteContext) {
  if (!concernsLogs(context)) {
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

function createResults(context: CommandPaletteContext): Result[] {
  if (!concernsLogs(context)) {
    return [];
  }

  const { resourceCache, tokens, namespace } = context;
  const pods = resourceCache[`${namespace}/pods`] as Pod[];
  if (typeof pods !== 'object') {
    //@ts-ignore  TODO: handle typein Result
    return [{ type: LOADING_INDICATOR }];
  }

  const podName = tokens[1];
  const containerName = tokens[2];
  if (podName) {
    const matchedByPodName = pods.filter(pod =>
      pod.metadata.name.includes(podName),
    );
    if (matchedByPodName) {
      return matchedByPodName.flatMap(pod =>
        makeListItem(pod, containerName, context),
      );
    }
    return [];
  } else {
    return pods.flatMap(pod => makeListItem(pod, containerName, context));
  }
}

export const logsHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  fetchResources: fetchLogs,
  createResults,
  getNavigationHelp: () => [{ name: 'logs', aliases: ['lg'] }],
};
