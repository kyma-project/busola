import LuigiClient from '@luigi-project/client';
import { setCluster } from 'components/Clusters/shared';
import { getSuggestion } from './helpers';

const createNonResourceOptions = ({ activeClusterName }) => [
  {
    names: ['clusters', 'cluster'],
    type: 'clusters',
  },
  {
    names: ['options', 'prefs', 'preferences', 'settings'],
    type: 'preferences',
  },
  {
    names: ['h', 'help'],
    type: 'show-help',
  },
  ...(activeClusterName
    ? [
        {
          names: ['overview', 'ov'],
          type: 'overview',
        },
      ]
    : []),
];

function resolveSearchResults(context) {
  const options = createNonResourceOptions(context);
  const option = options.find(o => o.names.includes(context.tokens[0]));
  if (option) {
    const { activeClusterName, clusterNames } = context;
    switch (option.type) {
      case 'clusters':
        return clusterNames.map(clusterName => ({
          label: `Cluster ${clusterName}`,
          onClick: () => setCluster(clusterName),
        }));
      case 'preferences':
        return [
          {
            label: 'Preferences',
            onClick: () => {
              LuigiClient.linkManager().openAsModal('/clusters/preferences', {
                title: 'Preferences',
                size: 'm',
              });
            },
          },
        ];
      case 'show-help':
        return [{ label: 'Show help', onClick: () => alert('todo show help') }];
      case 'overview':
        if (activeClusterName) {
          return [
            {
              label: 'Cluster Overview',
              onClick: () => {
                LuigiClient.linkManager()
                  .fromContext('cluster')
                  .navigate('/overview');
              },
            },
          ];
        } else {
          return null;
        }
      default:
        return null;
    }
  }
}

export function nonResourceHandler(context) {
  const options = createNonResourceOptions(context);
  const searchResults = resolveSearchResults(context);
  return {
    searchResults,
    suggestion: getSuggestion(
      context.tokens[0],
      options.flatMap(option => option.names),
    ),
  };
}
