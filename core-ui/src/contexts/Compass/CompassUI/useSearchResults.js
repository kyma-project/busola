import { useEffect } from 'react';
import {
  useFetch,
  useMicrofrontendContext,
  useFeatureToggle,
} from 'react-shared';
import { fetchResources, getSuggestions, createResults } from './handlers';
import { useResourceCache } from './useResourceCache';

export const LOADING_INDICATOR = 'LOADING_INDICATOR';

export function useSearchResults({ searchString, namespaceContext }) {
  const {
    clusters,
    activeClusterName,
    clusterNodes,
    namespaceNodes,
    hiddenNamespaces,
  } = useMicrofrontendContext();

  const [showHiddenNamespaces] = useFeatureToggle('showHiddenNamespaces');

  const fetch = useFetch();
  const [resourceCache, updateResourceCache] = useResourceCache();

  const preprocessedSearch = searchString.trim().toLowerCase();
  const context = {
    fetch: url => fetch({ relativeUrl: url }),
    namespace: namespaceContext || 'default',
    clusterNames: Object.keys(clusters),
    activeClusterName,
    search: preprocessedSearch,
    tokens: preprocessedSearch.split(/\s+/).filter(Boolean),
    clusterNodes: clusterNodes || [],
    namespaceNodes: namespaceNodes || [],
    hiddenNamespaces,
    showHiddenNamespaces,
    resourceCache,
    updateResourceCache,
  };

  useEffect(() => {
    if (searchString) {
      fetchResources(context);
    }
  }, [searchString, namespaceContext]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    results: createResults(context),
    suggestedSearch: getSuggestions(context)[0],
  };
}
