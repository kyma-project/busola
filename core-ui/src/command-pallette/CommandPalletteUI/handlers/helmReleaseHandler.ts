import { findRecentRelease } from 'components/HelmReleases/findRecentRelease';
import { groupBy } from 'lodash';
import { K8sResource } from 'types';
import { LOADING_INDICATOR } from '../types';
import { CommandPaletteContext, Handler, Result } from '../types';
import { getSuggestionsForSingleResource } from './helpers';

const helmReleaseResourceType = 'helmreleases';

function getAutocompleteEntries({
  tokens,
  namespace,
  resourceCache,
}: CommandPaletteContext): string[] {
  const tokenToAutocomplete = tokens[tokens.length - 1];

  switch (tokens.length) {
    case 1: // type
      if (helmReleaseResourceType.startsWith(tokenToAutocomplete)) {
        return [helmReleaseResourceType];
      }
      return [];
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

function getSuggestions({
  tokens,
  namespace,
  resourceCache,
}: CommandPaletteContext) {
  return getSuggestionsForSingleResource({
    tokens,
    resources: resourceCache[`${namespace}/helmreleases`] || [],
    resourceTypeNames: [helmReleaseResourceType],
  });
}

function makeListItem(item: K8sResource, context: CommandPaletteContext) {
  const name = item.metadata.labels.name;
  const { t, namespace, activeClusterName, navigate } = context;
  return {
    label: name,
    category: t('configuration.title') + ' > ' + t('helm-releases.title'),
    query: `helmreleases ${name}`,
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/namespaces/${namespace}/helm-releases/${name}`;
      navigate(pathname);
    },
  };
}

function concernsHelmReleases({ tokens }: CommandPaletteContext) {
  return tokens[0] === helmReleaseResourceType;
}

type Secret = K8sResource & {
  type: string;
};

async function fetchHelmReleases(context: CommandPaletteContext) {
  if (!concernsHelmReleases(context)) {
    return;
  }

  const { fetch, updateResourceCache, namespace } = context;
  try {
    const response = await fetch(`/api/v1/namespaces/${namespace}/secrets`);
    const data = await response.json();
    const allReleases = data.items.filter(
      (s: Secret) => s.type === 'helm.sh/release.v1',
    );

    const recentReleases = Object.values(
      groupBy(allReleases, r => r.metadata.labels.name),
    ).map(findRecentRelease);

    updateResourceCache(`${namespace}/helmreleases`, recentReleases);
  } catch (e) {
    console.warn(e);
  }
}

function createResults(context: CommandPaletteContext): Result[] | null {
  if (!concernsHelmReleases(context)) {
    return null;
  }

  const {
    resourceCache,
    tokens,
    namespace,
    navigate,
    t,
    activeClusterName,
  } = context;
  const helmReleases = resourceCache[`${namespace}/helmreleases`];

  const linkToList = {
    label: t('command-palette.results.list-of', {
      resourceType: t('helm-releases.title'),
    }),
    category: t('configuration.title') + ' > ' + t('helm-releases.title'),
    query: 'helmReleases',
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/namespaces/${namespace}/helm-releases`;
      navigate(pathname);
    },
  };

  if (typeof helmReleases !== 'object') {
    //@ts-ignore todo: how to handle 'type' in Result[]?
    return [linkToList, { type: LOADING_INDICATOR }];
  }

  const name = tokens[1];
  if (name) {
    const matchedByName = helmReleases.filter(item =>
      item.metadata.name.includes(name),
    );
    if (matchedByName) {
      return matchedByName.map(item => makeListItem(item, context));
    }
    return null;
  } else {
    return [
      linkToList,
      ...helmReleases.map(item => makeListItem(item, context)),
    ];
  }
}

export const helmReleaseHandler: Handler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchHelmReleases,
  createResults,
  getNavigationHelp: () => [{ name: 'helmreleases', aliases: ['helmr'] }],
};
