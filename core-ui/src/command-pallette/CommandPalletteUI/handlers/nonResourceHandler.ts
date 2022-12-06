import LuigiClient from '@luigi-project/client';
import { addCluster } from 'components/Clusters/shared';
import { CommandPaletteContext, Handler, Result } from '../types';
import { getSuggestion } from './helpers';

function createNonResourceOptions({
  activeClusterName,
}: {
  activeClusterName: string | undefined;
}) {
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

function getAutocompleteEntries(context: CommandPaletteContext) {
  const { tokens } = context;
  if (tokens.length > 1) return [];

  const options = createNonResourceOptions(context).map(
    option => option.names[0],
  );

  return options.filter(o => o.startsWith(tokens[0]));
}

function createResults(context: CommandPaletteContext): Result[] | null {
  const options = createNonResourceOptions(context);

  const option = options.find(o => o.names.includes(context.tokens[0]));
  if (option) {
    const { activeClusterName, clusterNames, clustersInfo, t } = context;
    switch (option.type) {
      case 'clusters':
        return clusterNames.map(clusterName => ({
          label: t('command-palette.resource-names.cluster', {
            name: clusterName,
          }),
          query: `cluster ${clusterName}`,
          onActivate: () => {
            const cluster = {
              name: clusterName,
              ...clustersInfo.clusters![clusterName],
            };
            addCluster(cluster, clustersInfo);
          },
        }));
      case 'help':
        return [
          {
            label: t('command-palette.results.help'),
            query: 'help',
            onActivate: () => false,
            customActionText: t('command-palette.item-actions.show-help'),
          },
        ];
      case 'preferences':
        return [
          {
            label: t('navigation.preferences.title'),
            query: 'preferences',
            onActivate: () => {
              context.setOpenPreferencesModal(true);
            },
            customActionText: t('command-palette.help.open-preferences'),
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
  return null;
}

export const nonResourceHandler: Handler = {
  getAutocompleteEntries,
  getSuggestions: context =>
    getSuggestion(
      context.tokens[0],
      createNonResourceOptions(context).flatMap(option => option.names),
    ),
  createResults,
  getNavigationHelp: () => [{ name: 'clusters' }],
  getOthersHelp: ({ t }) => [
    {
      name: 'clusters',
      alias: 'cl',
      description: t('command-palette.help.choose-cluster'),
    },
    {
      name: 'overview',
      alias: 'ov',
      description: t('clusters.overview.title-current-cluster'),
    },
    {
      name: 'preferences',
      alias: 'prefs',
      description: t('command-palette.help.open-preferences'),
    },
  ],
};
