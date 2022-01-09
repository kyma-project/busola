import LuigiClient from '@luigi-project/client';
import { getSuggestion } from './helpers';

const logNames = ['logs', 'log', 'lg'];

function makeListItem(pod, containerName) {
  const podName = pod.metadata.name;
  const namespacePart = `namespaces/${pod.metadata.namespace}`;

  const containers = pod.spec.containers.filter(
    c => !containerName || c.name.includes(containerName),
  );

  return containers.map(({ name: containerName }) => {
    const label = `Logs for ${podName}/${containerName}`;
    const query = `logs ${podName}${containerName ? ` ${containerName}` : ''}`;

    return {
      label,
      category: 'Workloads',
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

async function fetchLogs({ fetch, tokens, namespace }) {
  const [type, podName, containerName] = tokens;
  if (!logNames.includes(type)) {
    return null;
  }

  try {
    const response = await fetch(`/api/v1/namespaces/${namespace}/pods`);
    const { items: pods } = await response.json();

    if (podName) {
      const matchedByPodName = pods.filter(pod =>
        pod.metadata.name.includes(podName),
      );
      if (matchedByPodName) {
        return matchedByPodName.flatMap(pod =>
          makeListItem(pod, containerName),
        );
      }
      return null;
    } else {
      return pods.flatMap(pod => makeListItem(pod, containerName));
    }
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function logsHandler(context) {
  return {
    searchResults: await fetchLogs(context),
    suggestion: getSuggestion(context.tokens[0], logNames),
  };
}
