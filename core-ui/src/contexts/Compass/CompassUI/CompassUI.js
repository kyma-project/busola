import React, { useEffect, useRef, useState } from 'react';
import { Spinner, useFetch, useMicrofrontendContext } from 'react-shared';
import { SuggestedSearch } from './components';
import { search } from './handlers';
import './CompassUI.scss';
import { FormInput, Token } from 'fundamental-react';
import { ResultsList } from './ResultsList/ResultsList';

export function CompassUI({ hide }) {
  const {
    namespaceId: namespace,
    clusters,
    activeClusterName,
    clusterNodes,
    namespaceNodes,
  } = useMicrofrontendContext();
  const [searchString, setSearchString] = useState('');
  const [results, setResults] = useState([]);
  const [suggestedSearch, setSuggestedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const fetch = useFetch();
  const inputRef = useRef();
  const lastSearchTime = useRef(0);
  const [namespaceContext, setNamespaceContext] = useState(namespace);

  const onBackgroundClick = e => {
    if (e.nativeEvent.srcElement.id === 'background') {
      hide();
    }
  };

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
      };

      const { searchResults, suggestion, searchStartTime } = await search(
        context,
      );

      // make sure older, slower searches don't override never that returned almost immiediately
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

  useEffect(() => {
    setNamespaceContext(namespace);
  }, [namespace]);

  return (
    <div id="background" className="compass-ui" onClick={onBackgroundClick}>
      <div className="compass-ui__wrapper" role="dialog">
        <div className="compass-ui__content">
          {namespaceContext && (
            <div style={{ maxWidth: 'fit-content' }}>
              <Token
                buttonLabel=""
                className="y-fd-token y-fd-token--no-button y-fd-token--gap fd-margin-end--tiny"
                onClick={() => setNamespaceContext(null)}
              >
                {namespaceContext}
              </Token>
            </div>
          )}
          <FormInput
            value={searchString}
            onChange={e => setSearchString(e.target.value)}
            autoFocus
            ref={inputRef}
            className="search-input"
          />
          {loading && <Spinner />}
          {!loading && searchString && (
            <ResultsList
              results={results}
              hide={hide}
              suggestion={
                <SuggestedSearch
                  search={searchString}
                  suggestedSearch={suggestedSearch}
                  setSearch={search => {
                    setSearchString(search);
                    inputRef.current.focus();
                  }}
                />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
