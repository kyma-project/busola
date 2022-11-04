import { RecoilValueReadOnly, selector } from 'recoil';
import { configFeaturesState } from '../configFeatures/configFeaturesAtom';
import { predefinedCategories } from './categories';
import { configFeaturesNames, NavNode } from '../types';
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

export const externalNodesSelector: RecoilValueReadOnly<
  any[] | null
> = selector<any[] | null>({
  key: 'externalNodesSelector',
  get: async ({ get }) => {
    const configFeatures = get(configFeaturesState);
    const fetchFn = getFetchFn(get);
    if (!fetchFn) {
      return null;
    }

    const isObservabilityEnabled =
      configFeatures[configFeaturesNames.OBSERVABILITY]?.isEnabled;
    const isExternalNodesEnabled =
      configFeatures[configFeaturesNames.EXTERNAL_NODES]?.isEnabled;

    if (!isObservabilityEnabled && !isExternalNodesEnabled) {
      return [];
    }
    let observabilityNodes: any[] = [];
    let externalNodes: any[] = [];

    if (isObservabilityEnabled) {
      const links =
        configFeatures[configFeaturesNames.OBSERVABILITY]!.config?.links || [];

      observabilityNodes = await Promise.all(
        links.map(async ({ label, path }: { label: string; path: string }) => {
          let url = '';
          try {
            url = await fetchObservabilityHost(fetchFn, path);
          } catch (e) {
            //this error is caught to not reach the ErrorBoundary component
            console.error('Cannot fetch an observability link: ', e);
          }
          if (url) {
            return createExternalNode(url, label);
          }
        }),
      );
    }

    if (isExternalNodesEnabled) {
      const links =
        configFeatures[configFeaturesNames.EXTERNAL_NODES]!.nodes || [];

      links.forEach(
        ({
          category,
          icon,
          children,
        }: {
          category: string;
          icon: IconGlyph;
          children: any[];
        }) => {
          children.map(({ label, link }: { label: string; link: string }) => {
            console.log(links);
            externalNodes.push(createExternalNode(link, label, category, icon));
          });
        },
      );
    }

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
