import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useFetch,
  useMicrofrontendContext,
  useFeatureToggle,
} from 'react-shared';
import * as handlers from './handlers';

export const LOADING_INDICATOR = 'LOADING_INDICATOR';

export function useSearchResults({
  query,
  namespaceContext,
  resourceCache,
  updateResourceCache,
}) {
  const {
    clusters,
    activeClusterName,
    clusterNodes,
    namespaceNodes,
    hiddenNamespaces,
  } = useMicrofrontendContext();
  const [showHiddenNamespaces] = useFeatureToggle('showHiddenNamespaces');
  const fetch = useFetch();
  const { t } = useTranslation();

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
    t,
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
