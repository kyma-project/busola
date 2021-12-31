import didYouMean from 'didyoumean';

export function parseQuery({ search, activeClusterName }) {
  if (search.split(/\s+/).length !== 1) {
    return null;
  }

  const nonResourceOptions = [
    {
      names: ['clusters'],
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
            names: ['overview'],
            type: 'overview',
          },
        ]
      : []),
  ];

  for (const option of nonResourceOptions) {
    if (option.names.includes(search)) {
      return {
        query: { type: option.type },
        suggestedSearch: null,
      };
    }
  }

  const suggestedSearch = didYouMean(
    search,
    nonResourceOptions.flatMap(o => o.names),
  );
  if (suggestedSearch) {
    return {
      query: null,
      suggestedSearch,
    };
  } else {
    return null;
  }
}

export function createResults({ query, clusters, activeClusterName }) {
  switch (query.type) {
    case 'clusters':
      return Object.keys(clusters).map(clusterName => ({
        title: `Cluster ${clusterName}`,
        type: 'navigation',
        url: `/cluster/${clusterName}`,
      }));
    case 'preferences':
      return [{ title: 'Prefernces', type: 'open-preferences' }];
    case 'show-help':
      return [{ title: 'Show help', type: 'show-help' }];
    case 'overview':
      if (activeClusterName) {
        return [
          {
            title: 'Cluster Overview',
            type: 'navigation',
            url: `/cluster/${activeClusterName}/overview`,
          },
        ];
      } else {
        return null;
      }
  }
  return null;
}
