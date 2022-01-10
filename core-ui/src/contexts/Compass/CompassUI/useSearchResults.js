import { useEffect } from 'react';
import {
  useFetch,
  useMicrofrontendContext,
  useFeatureToggle,
} from 'react-shared';
import * as handlers from './handlers';
import { useResourceCache } from './useResourceCache';

export const LOADING_INDICATOR = 'LOADING_INDICATOR';

export function useSearchResults({ search, namespaceContext }) {
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

  const preprocessedSearch = search.trim().toLowerCase();
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
    if (search) {
      handlers.fetchResources(context);
    }
  }, [search, namespaceContext]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    results: handlers.createResults(context),
    suggestedSearch: handlers.getSuggestions(context)[0],
    autocompletePhrase: handlers.getAutocompleteEntries(context),
  };
}
