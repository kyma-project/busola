import { useEffect } from 'react';
import {
  useFetch,
  useMicrofrontendContext,
  useFeatureToggle,
} from 'react-shared';
import * as handlers from './handlers';
import { useResourceCache } from './useResourceCache';

export const LOADING_INDICATOR = 'LOADING_INDICATOR';

function findCommonPrefix(words, initialPrefix) {
  words.sort();
  const first = words[0];
  const last = words[words.length - 1];
  let biggestCommonPrefix = initialPrefix;
  while (
    first[biggestCommonPrefix.length] &&
    first[biggestCommonPrefix.length] === last[biggestCommonPrefix.length]
  ) {
    console.log(first, biggestCommonPrefix.length);
    biggestCommonPrefix += first[biggestCommonPrefix.length];
  }

  return biggestCommonPrefix;
}

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
  // todo disable for no cluster
  var a = handlers.getAutocompleteEntries(context);
  console.log(a);
  var autoCompleteEntries = [];
  if (a.length) {
    autoCompleteEntries = findCommonPrefix(
      a,
      search, // todo czasem searchString czasem search
    );
    console.log('PREFIX', autoCompleteEntries);
    if (autoCompleteEntries === search) {
      autoCompleteEntries = [];
    } else {
      autoCompleteEntries = [autoCompleteEntries];
    }
  }

  return {
    results: handlers.createResults(context),
    suggestedSearch: handlers.getSuggestions(context)[0],
    autoCompleteEntries,
  };
}
