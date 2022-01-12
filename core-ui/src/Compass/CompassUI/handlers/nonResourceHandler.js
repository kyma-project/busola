import LuigiClient from '@luigi-project/client';
import { setCluster } from 'components/Clusters/shared';
import { getSuggestion } from './helpers';

function createNonResourceOptions({ activeClusterName }) {
  return [
    {
      names: ['clusters', 'cluster'],
      type: 'clusters',
    },
    {
      names: ['preferences', 'prefs'],
      type: 'preferences',
    },
    {
      names: ['help', '?'],
      type: 'help',
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
}

function getAutocompleteEntries(context) {
  const { tokens } = context;
  if (tokens.length > 1) return [];

  const options = createNonResourceOptions(context).map(
    option => option.names[0],
  );

  return options.filter(o => o.startsWith(tokens[0]));
}

function createResults(context) {
  const options = createNonResourceOptions(context);

  const option = options.find(o => o.names.includes(context.tokens[0]));
  if (option) {
    const { activeClusterName, clusterNames, showHelp, t } = context;
    switch (option.type) {
      case 'clusters':
        return clusterNames.map(clusterName => ({
          label: `Cluster ${clusterName}`,
          query: `cluster ${clusterName}`,
          onActivate: () => setCluster(clusterName),
        }));
      case 'help':
        return {
          label: t('compass.results.help'),
          query: 'help',
          onActivate: () => false,
          customActionText: t('compass.item-actions.show-help'),
        };
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
            customActionText: t('compass.item-actions.open'),
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
  getAutocompleteEntries,
  getSuggestions: context =>
    getSuggestion(
      context.tokens[0],
      createNonResourceOptions(context).flatMap(option => option.names),
    ),
  fetchResources: () => {},
  createResults,
};
