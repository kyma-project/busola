import React, { useEffect, useRef, useState } from 'react';
import { Spinner, useFetch, useMicrofrontendContext } from 'react-shared';
import { SuggestedSearch, Result } from './components';
import { search } from './search';

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
  const a = useRef(0);
  // const abortController = useRef();

  const onBackgroundClick = e => {
    if (e.nativeEvent.srcElement.id === 'background') {
      hide();
    }
  };

  useEffect(() => {
    async function doSearch() {
      if (loading) return;
      setLoading(true);

      const preprocessedSearch = searchString.trim().toLowerCase();
      const context = {
        fetch: async url => {
          // if (abortController.current) {
          //   console.log('abort',searchString)
          //   abortController.current.abort();
          // }
          // abortController.current = new AbortController();
          // return await fetch({
          //   relativeUrl: url,
          //   abortController: abortController.current,
          // });
          return fetch({ relativeUrl: url });
        },
        namespace,
        clusterNames: Object.keys(clusters),
        activeClusterName,
        search: preprocessedSearch,
        tokens: preprocessedSearch.split(/\s+/),
        clusterNodes,
        namespaceNodes,
      };

      //todo too fast
      const { searchResults, suggestion } = await search(context);

      setSuggestedSearch(suggestion);
      setResults(searchResults);

      setLoading(false);
    }
    if (searchString) {
      doSearch();
    }
  }, [searchString]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="background" className="compass-ui" onClick={onBackgroundClick}>
      <div className="compass-ui__wrapper" role="dialog">
        <div className="compass-ui__content">
          <input
            value={searchString}
            onChange={e => setSearchString(e.target.value)}
            autoFocus
            ref={inputRef}
          />
          {loading && <Spinner />}
          <ul>
            {!loading && results?.length
              ? results.map(s => (
                  <ul key={s.label} onClick={hide}>
                    <Result {...s} />
                  </ul>
                ))
              : 'No Results Found'}
          </ul>
          <div>
            <SuggestedSearch
              search={searchString}
              suggestedSearch={suggestedSearch}
              setSearch={search => {
                setSearchString(search);
                inputRef.current.focus();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
