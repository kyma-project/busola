import React, { useEffect, useState } from 'react';
import { Spinner, useFetch, useMicrofrontendContext } from 'react-shared';
import { getSuggestions, resources, Suggestion } from './CompassContext';
import didYouMean from 'didyoumean';

function DidYouMean({ search, setSearch }) {
  const availableWords = resources.flatMap(res => [res.name, ...res.aliases]);
  if (!search) return null;

  const tokens = search.split(/\s+/);

  const suggestedSearch = tokens
    .map(token => didYouMean(token, availableWords) || token)
    .join(' ');

  if (suggestedSearch === search) {
    return null;
  }

  return (
    <>
      Did you mean:
      <button onClick={() => setSearch(suggestedSearch)}>
        {suggestedSearch}
      </button>
    </>
  );
}

export function CompassUI({ hide }) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
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
      setSuggestions(
        await getSuggestions({
          search,
          namespace,
          fetch: url => fetch({ relativeUrl: url }),
        }),
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
            {!loading && suggestions.length
              ? suggestions.map(s => (
                  <ul key={s.name} onClick={hide}>
                    <Suggestion {...s} />
                  </ul>
                ))
              : 'nope'}
          </ul>
          <div>
            <DidYouMean search={search} setSearch={setSearch} />
          </div>
        </div>
      </div>
    </div>
  );
}
