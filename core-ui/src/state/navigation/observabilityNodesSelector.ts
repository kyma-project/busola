import { RecoilValueReadOnly, selector } from 'recoil';
import { configFeaturesState } from '../configFeatures/configFeaturesAtom';
import { predefinedCategories } from './categories';
import { configFeaturesNames, NavNode } from '../types';
import { getFetchFn } from '../utils/getFetchFn';
import { FetchFn } from '../../shared/hooks/BackendAPI/useFetch';
import { getClusterConfig } from '../../shared/utils/getClusterConfig';

const createObservabilityNode = (url: string, label: string): NavNode => ({
  resourceType: '',
  category: predefinedCategories.observability,
  namespaced: false,
  label: label,
  pathSegment: '',
  requiredFeatures: [],
  apiVersion: '',
  apiGroup: '',
  externalUrl: `https://${url}`,
});

export const observabilityNodesSelector: RecoilValueReadOnly<
  any[] | null
> = selector<any[] | null>({
  key: 'externalNodesSelector',
  get: async ({ get }) => {
    const configFeatures = get(configFeaturesState);
    const { backendAddress } = getClusterConfig();
    const fetchFn = getFetchFn(get);
    if (!fetchFn) {
      return null;
    }

    const isObservabilityEnabled =
      configFeatures[configFeaturesNames.OBSERVABILITY]?.isEnabled;

    if (!isObservabilityEnabled) {
      return [];
    }
    const links =
      configFeatures[configFeaturesNames.OBSERVABILITY]!.config?.links || [];

    const navNodes = await Promise.all(
      links.map(async ({ label, path }: { label: string; path: string }) => {
        let url = '';
        try {
          url = await fetchObservabilityHost(fetchFn, backendAddress, path);
        } catch (e) {
          url = backendAddress + '' + path;
          //this error is caught to not reach the ErrorBoundary component
          console.error('Cannot fetch an observability link: ', e);
        }

        if (url) {
          return createObservabilityNode(url, label);
        }
      }),
    );

    return navNodes.filter(n => n);
  },
});

async function fetchObservabilityHost(
  fetchFn: FetchFn,
  backendAddress: string,
  vsPath: string,
) {
  const res = await fetchFn({
    relativeUrl: backendAddress + '/' + vsPath,
    init: {},
  });
  return (await res.json()).spec.hosts[0];
}
