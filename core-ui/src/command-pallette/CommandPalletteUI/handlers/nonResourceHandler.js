import LuigiClient from '@luigi-project/client';
import { setCluster } from 'components/Clusters/shared';
import { getSuggestion } from './helpers';

function createNonResourceOptions({ activeClusterName }) {
  return [
    {
      names: ['clusters', 'cluster', 'cl'],
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
    const { activeClusterName, clusterNames, t } = context;
    switch (option.type) {
      case 'clusters':
        return clusterNames.map(clusterName => ({
          label: t('command-palette.resource-names.cluster', {
            name: clusterName,
          }),
          query: `cluster ${clusterName}`,
          onActivate: () => setCluster(clusterName),
        }));
      case 'help':
        return {
          label: t('command-palette.results.help'),
          query: 'help',
          onActivate: () => false,
          customActionText: t('command-palette.item-actions.show-help'),
        };
      case 'preferences':
        return [
          {
            label: t('preferences.title'),
            query: 'preferences',
            onActivate: () => {
              LuigiClient.linkManager().openAsModal('/clusters/preferences', {
                title: t('preferences.title'),
                size: 'm',
              });
            },
            customActionText: t('command-palette.item-actions.open'),
          },
        ];
      case 'overview':
        if (activeClusterName) {
          return [
            {
              label: t('clusters.overview.title-current-cluster'),
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
  createResults,
  getNavigationHelp: () => [['clusters']],
  getOthersHelp: ({ t }) => [
    ['clusters', 'cl', t('command-palette.help.choose-cluster')],
    ['overview', 'ov', t('clusters.overview.title-current-cluster')],
    ['preferences', 'prefs', t('command-palette.help.open-preferences')],
  ],
};
