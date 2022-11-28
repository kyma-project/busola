import { RecoilValueReadOnly, selector } from 'recoil';
import { configFeaturesState } from '../configFeatures/configFeaturesSelector';
import { predefinedCategories } from './categories';
import { ConfigFeature, configFeaturesNames, NavNode } from '../types';
import { getFetchFn } from '../utils/getFetchFn';
import { FetchFn } from '../../shared/hooks/BackendAPI/useFetch';
import { IconGlyph } from 'fundamental-react/lib/Icon/Icon';

const createExternalNode = (
  url: string,
  label: string,
  category?: string,
  icon?: IconGlyph,
): NavNode => ({
  resourceType: '',
  category: category || predefinedCategories.observability,
  icon: icon,
  namespaced: false,
  label: label,
  pathSegment: '',
  requiredFeatures: [],
  apiVersion: '',
  apiGroup: '',
  externalUrl: url.startsWith('http') ? url : `https://${url}`,
});

const getObservabilityNodes = async (
  fetchFn: FetchFn,
  observabilityFeature: ConfigFeature | undefined,
): Promise<NavNode[]> => {
  if (!observabilityFeature?.isEnabled) {
    return [];
  }

  const links = observabilityFeature!.config?.links || [];

  return await Promise.all(
    links.map(async ({ label, path }: { label: string; path: string }) => {
      try {
        const url = await fetchObservabilityHost(fetchFn, path);
        return createExternalNode(url, label);
      } catch (e) {
        //this error is caught to not reach the ErrorBoundary component
        console.error('Cannot fetch an observability link: ', e);
        return null;
      }
    }),
  );
};

const getExternalNodes = (
  externalNodesFeature: ConfigFeature | undefined,
): NavNode[] => {
  const links = externalNodesFeature!.nodes || [];

  type NodeChild = { label: string; link: string };

  return links.flatMap(
    ({
      category,
      icon,
      children,
    }: {
      category: string;
      icon: IconGlyph;
      children: NodeChild[];
    }) =>
      children.map(({ label, link }) =>
        createExternalNode(link, label, category, icon),
      ),
  );
};

export const externalNodesSelector: RecoilValueReadOnly<
  NavNode[] | null
> = selector<NavNode[] | null>({
  key: 'externalNodesSelector',
  get: async ({ get }) => {
    const configFeatures = get(configFeaturesState);
    const fetchFn = getFetchFn(get);
    if (!fetchFn || !configFeatures) {
      return null;
    }

    if (!configFeatures[configFeaturesNames.EXTERNAL_NODES]?.isEnabled) {
      return [];
    }

    const observabilityNodes = await getObservabilityNodes(
      fetchFn,
      configFeatures[configFeaturesNames.OBSERVABILITY],
    );
    const externalNodes = getExternalNodes(
      configFeatures[configFeaturesNames.EXTERNAL_NODES],
    );

    return [
      ...observabilityNodes.filter(n => n),
      ...externalNodes.filter(n => n),
    ];
  },
});

async function fetchObservabilityHost(fetchFn: FetchFn, vsPath: string) {
  const res = await fetchFn({
    relativeUrl: '/' + vsPath,
    init: {},
  });
  return (await res.json()).spec.hosts[0];
}
