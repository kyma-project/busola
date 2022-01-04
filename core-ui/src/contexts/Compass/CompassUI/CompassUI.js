import React, { useEffect, useRef, useState } from 'react';
import { Spinner, useFetch, useMicrofrontendContext } from 'react-shared';
import { SuggestedSearch, Result } from './components';
import { search } from './handlers';
import './CompassUI.scss';

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
        namespace,
        clusterNames: Object.keys(clusters),
        activeClusterName,
        search: preprocessedSearch,
        tokens: preprocessedSearch.split(/\s+/),
        clusterNodes,
        namespaceNodes,
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
