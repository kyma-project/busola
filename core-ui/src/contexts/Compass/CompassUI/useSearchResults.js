import { useEffect, useRef, useState } from 'react';
import {
  useFetch,
  useMicrofrontendContext,
  useFeatureToggle,
} from 'react-shared';
import { search } from './handlers';

export function useSearchResults({ searchString, namespaceContext }) {
  const {
    clusters,
    activeClusterName,
    clusterNodes,
    namespaceNodes,
    hiddenNamespaces,
  } = useMicrofrontendContext();

  const [showHiddenNamespaces] = useFeatureToggle('showHiddenNamespaces');
  const lastSearchTime = useRef(0);
  const [results, setResults] = useState([]);
  const [suggestedSearch, setSuggestedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const fetch = useFetch();

  useEffect(() => {
    async function doSearch() {
      setLoading(true);

      const preprocessedSearch = searchString.trim().toLowerCase();
      lastSearchTime.current = Date.now();

      const context = {
        fetch: url => fetch({ relativeUrl: url }),
        namespace: namespaceContext || 'default',
        clusterNames: Object.keys(clusters),
        activeClusterName,
        search: preprocessedSearch,
        tokens: preprocessedSearch.split(/\s+/),
        clusterNodes: clusterNodes || [],
        namespaceNodes: namespaceNodes || [],
        searchStartTime: lastSearchTime.current,
        hiddenNamespaces,
        showHiddenNamespaces,
      };

      const { searchResults, suggestion, searchStartTime } = await search(
        context,
      );

      // make sure older, slower searches don't override newer ones that returned almost immiediately
      if (lastSearchTime.current <= searchStartTime) {
        setSuggestedSearch(suggestion);
        setResults(searchResults);
      }

      setLoading(false);
    }

    if (searchString) {
      doSearch();
    }
  }, [searchString, namespaceContext]); // eslint-disable-line react-hooks/exhaustive-deps

  return { results, suggestedSearch, loading };
}
