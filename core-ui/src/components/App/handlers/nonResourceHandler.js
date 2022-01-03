import { setCluster } from '../../cluster-management/cluster-management';
import { getSuggestion } from './helpers';

const createNonResourceOptions = ({ cluster }) => [
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
  ...(cluster
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
    const { cluster, clusterNames } = context;
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
              Luigi.navigation().openAsModal('/clusters/preferences', {
                title: 'Preferences',
                size: 'm',
              });
            },
          },
        ];
      case 'show-help':
        return [{ label: 'Show help', onClick: () => alert('todo show help') }];
      case 'overview':
        if (cluster) {
          return [
            {
              label: 'Cluster Overview',
              onClick: () => {
                Luigi.navigation().navigate(`/cluster/${cluster}/overview`);
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
