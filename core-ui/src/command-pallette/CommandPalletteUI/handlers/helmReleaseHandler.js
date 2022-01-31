import LuigiClient from '@luigi-project/client';
import { findRecentRelease } from 'components/HelmReleases/findRecentRelease';
import { groupBy } from 'lodash';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getSuggestionsForSingleResource } from './helpers';

const helmReleaseResourceType = 'helmreleases';

function getAutocompleteEntries({ tokens, namespace, resourceCache }) {
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      if (helmReleaseResourceType.startsWith(tokenToAutocomplete)) {
        return helmReleaseResourceType;
      }
      break;
    case 2: // name
      const helmReleaseNames = (
        resourceCache[`${namespace}/helmreleases`] || []
      ).map(n => n.metadata.name);
      return helmReleaseNames
        .filter(name => name.startsWith(tokenToAutocomplete))
        .map(name => `${tokens[0]} ${name} `);
    default:
      return [];
  }
}

function getSuggestions({ tokens, namespace, resourceCache }) {
  return getSuggestionsForSingleResource({
    tokens,
    resources: resourceCache[`${namespace}/helmreleases`] || [],
    resourceTypeNames: [helmReleaseResourceType],
  });
}

function makeListItem(item, namespace, t) {
  const name = item.metadata.labels.name;

  return {
    label: name,
    category: t('configuration.title') + ' > ' + t('helm-releases.title'),
    query: `helmreleases ${name}`,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(`/namespaces/${namespace}/helm-releases/details/${name}`),
  };
}

function concernsHelmReleases({ tokens }) {
  return tokens[0] === helmReleaseResourceType;
}

async function fetchHelmReleases(context) {
  if (!concernsHelmReleases(context)) {
    return;
  }

  const { fetch, updateResourceCache, namespace } = context;
  try {
    const response = await fetch(`/api/v1/namespaces/${namespace}/secrets`);
    const data = await response.json();
    const allReleases = data.items.filter(s => s.type === 'helm.sh/release.v1');

    const recentReleases = Object.values(
      groupBy(allReleases, r => r.metadata.labels.name),
    ).map(findRecentRelease);

    updateResourceCache(`${namespace}/helmreleases`, recentReleases);
  } catch (e) {
    console.warn(e);
  }
}

function createResults(context) {
  if (!concernsHelmReleases(context)) {
    return;
  }

  const { resourceCache, tokens, namespace, t } = context;
  const helmReleases = resourceCache[`${namespace}/helmreleases`];

  const linkToList = {
    label: t('command-palette.results.list-of', {
      resourceType: t('helm-releases.title'),
    }),
    category: t('configuration.title') + ' > ' + t('helm-releases.title'),
    query: 'helmReleases',
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(`/namespaces/${namespace}/helm-releases`),
  };

  if (typeof helmReleases !== 'object') {
    return [linkToList, { type: LOADING_INDICATOR }];
  }

  const name = tokens[1];
  if (name) {
    const matchedByName = helmReleases.filter(item =>
      item.metadata.name.includes(name),
    );
    if (matchedByName) {
      return matchedByName.map(item => makeListItem(item, namespace, t));
    }
    return null;
  } else {
    return [
      linkToList,
      ...helmReleases.map(item => makeListItem(item, namespace, t)),
    ];
  }
}

export const helmReleaseHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchHelmReleases,
  createResults,
  getNavigationHelp: () => [['helmreleases']],
};
