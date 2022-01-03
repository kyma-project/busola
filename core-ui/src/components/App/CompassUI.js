import React, { useEffect, useState } from 'react';
import { Spinner, useFetch, useMicrofrontendContext } from 'react-shared';
import { parseQuery, createResults } from './todo';
import { SuggestedSearch, Result } from './components';

export function CompassUI({ hide }) {
  const {
    namespaceId: namespace,
    clusters,
    activeClusterName,
  } = useMicrofrontendContext();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [suggestedSearch, setSuggestedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const fetch = useFetch();

  const onBackgroundClick = e => {
    if (e.nativeEvent.srcElement.id === 'background') {
      hide();
    }
  };

  useEffect(() => {
    async function doSearch() {
      setLoading(true);

      const res = parseQuery({
        search: search.trim().toLowerCase(),
        namespace,
        activeClusterName,
      });
      if (!res) {
        setLoading(false);
        setSuggestedSearch(null);
        setResults(null);
        return;
      }
      const { query, suggestedSearch } = res;
      setSuggestedSearch(suggestedSearch);
      setResults(
        query &&
          (await createResults({
            query,
            fetch: url => fetch({ relativeUrl: url }),
            clusters,
            activeClusterName,
            namespace,
          })),
      );

      setLoading(false);
    }
    if (search) {
      doSearch();
    }
  }, [search]);

  return (
    <div id="background" className="compass-ui" onClick={onBackgroundClick}>
      <div className="compass-ui__wrapper">
        <div className="compass-ui__content">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {loading && <Spinner />}
          <ul>
            {!loading && results?.length
              ? results.map(s => (
                  <ul key={s.name} onClick={hide}>
                    <Result {...s} />
                  </ul>
                ))
              : 'nope'}
          </ul>
          <div>
            <SuggestedSearch
              search={search}
              suggestedSearch={suggestedSearch}
              setSearch={setSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
