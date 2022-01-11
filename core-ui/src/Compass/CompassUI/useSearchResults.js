import { useEffect } from 'react';
import {
  useFetch,
  useMicrofrontendContext,
  useFeatureToggle,
} from 'react-shared';
import * as handlers from './handlers';
import { useResourceCache } from './useResourceCache';

export const LOADING_INDICATOR = 'LOADING_INDICATOR';

export function useSearchResults({ query, namespaceContext }) {
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

  const preprocessedQuery = query.trim().toLowerCase();
  const context = {
    fetch: url => fetch({ relativeUrl: url }),
    namespace: namespaceContext || 'default',
    clusterNames: Object.keys(clusters),
    activeClusterName,
    query: preprocessedQuery,
    tokens: preprocessedQuery.split(/\s+/).filter(Boolean),
    clusterNodes: clusterNodes || [],
    namespaceNodes: namespaceNodes || [],
    hiddenNamespaces,
    showHiddenNamespaces,
    resourceCache,
    updateResourceCache,
  };

  useEffect(() => {
    if (query) {
      handlers.fetchResources(context);
    }
  }, [query, namespaceContext]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    results: handlers.createResults(context),
    suggestedQuery: handlers.getSuggestions(context)[0],
    autocompletePhrase: handlers.getAutocompleteEntries(context),
  };
}
