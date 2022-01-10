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

function createResults(context) {
  const options = createNonResourceOptions(context);

  const option = options.find(o => o.names.includes(context.tokens[0]));
  if (option) {
    const { activeClusterName, clusterNames } = context;
    switch (option.type) {
      case 'clusters':
        return clusterNames.map(clusterName => ({
          label: `Cluster ${clusterName}`,
          query: `cluster ${clusterName}`,
          onActivate: () => setCluster(clusterName),
        }));
      case 'preferences':
        return [
          {
            label: 'Preferences',
            query: 'preferences',
            onActivate: () => {
              LuigiClient.linkManager().openAsModal('/clusters/preferences', {
                title: 'Preferences',
                size: 'm',
              });
            },
            customActionText: 'Open',
          },
        ];
      case 'show-help':
        return [
          {
            label: 'Help',
            query: 'help',
            onActivate: () => alert('todo show help or just hotkeys'),
            customActionText: 'Show',
          },
        ];
      case 'overview':
        if (activeClusterName) {
          return [
            {
              label: 'Cluster Overview',
              query: 'overview',
              onActivate: () => {
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

export const nonResourceHandler = {
  getSuggestions: context =>
    getSuggestion(
      context.tokens[0],
      createNonResourceOptions(context).flatMap(option => option.names),
    ),
  fetchResources: () => {},
  createResults,
};
