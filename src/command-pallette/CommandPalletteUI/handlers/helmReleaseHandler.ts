import { findRecentRelease } from 'components/HelmReleases/findRecentRelease';
import { groupBy } from 'lodash';
import { K8sResource, Secret } from 'types';
import {
  CommandPaletteContext,
  Handler,
  Result,
  LOADING_INDICATOR,
} from '../types';
import { getSuggestionForSingleResource } from './helpers';

const helmReleaseResourceType = 'helmreleases';
const helmReleaseAliases = ['helmr'];

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
    case 3: // name
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

function getSuggestion({
  tokens,
  namespace,
  resourceCache,
}: CommandPaletteContext) {
  return getSuggestionForSingleResource({
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
    query: `helmreleases/${name}`,
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/namespaces/${namespace}/helm-releases/${name}`;
      navigate(pathname);
    },
    customActionText: 'command-palette.item-actions.navigate',
  };
}

function concernsHelmReleases({ tokens }: CommandPaletteContext) {
  return (
    helmReleaseAliases.some(hra => hra.startsWith(tokens[0])) ||
    tokens[0] === helmReleaseResourceType
  );
}

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
    label: t('helm-releases.title'),
    category: t('configuration.title') + ' > ' + t('helm-releases.title'),
    query: 'helmReleases',
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/namespaces/${namespace}/helm-releases`;
      navigate(pathname);
    },
    aliases: helmReleaseAliases,
  };

  if (typeof helmReleases !== 'object') {
    //@ts-ignore todo: how to handle 'type' in Result[]?
    return [linkToList, { type: LOADING_INDICATOR }];
  }

  const [, delimiter, name] = tokens;
  if (name) {
    const matchedByName = helmReleases.filter(item =>
      item.metadata.name.includes(name),
    );
    if (matchedByName) {
      return matchedByName.map(item => makeListItem(item, context));
    }
    return null;
  } else if (delimiter) {
    return [...helmReleases.map(item => makeListItem(item, context))];
  } else {
    return [linkToList];
  }
}

export const helmReleaseHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  fetchResources: fetchHelmReleases,
  createResults,
  getNavigationHelp: () => [
    { name: 'helmreleases', aliases: helmReleaseAliases },
  ],
};
