import React, { useEffect, useRef } from 'react';
import { useEventListener } from 'hooks/useEventListener';
import { Result } from './Result';
import { Spinner } from 'react-shared';
import { addHistoryEntry } from '../search-history';
import './ResultsList.scss';
import { LOADING_INDICATOR } from '../useSearchResults';

function scrollInto(element) {
  element.scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'smooth',
  });
}

export function ResultsList({
  results,
  hide,
  suggestion,
  activeIndex,
  setActiveIndex,
  isHistoryMode,
}) {
  const listRef = useRef();

  const isLoading = results.includes(LOADING_INDICATOR);
  results = results.filter(r => r !== LOADING_INDICATOR);

  useEffect(() => {
    if (results?.length < activeIndex) {
      setActiveIndex(0);
    }
  }, [results, activeIndex, setActiveIndex]);

  useEventListener(
    'keydown',
    ({ key }) => {
      if (isHistoryMode) return;

      if (key === 'ArrowDown' && activeIndex < results?.length - 1) {
        setActiveIndex(activeIndex + 1);
        scrollInto(listRef.current.children[activeIndex + 1]);
      } else if (key === 'ArrowUp' && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
        scrollInto(listRef.current.children[activeIndex - 1]);
      } else if (key === 'Enter' && results?.[activeIndex]) {
        addHistoryEntry(results[activeIndex].query);
        results[activeIndex].onActivate();
      }
    },
    [activeIndex, results, isHistoryMode],
  );

  return (
    <>
      <ul className="compass-ui__results" ref={listRef}>
        {results?.length ? (
          results.map((result, i) => (
            <Result
              key={result.label}
              {...result}
              index={i}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              onItemClick={() => {
                addHistoryEntry(result.query);
                result.onActivate();
                hide();
              }}
            />
          ))
        ) : (
          <div className="result result--disabled">
            <p className="label label--non-interactable">No results found</p>
            <p className="description">{suggestion}</p>
          </div>
        )}
      </ul>
      {isLoading && <Spinner />}
    </>
  );
}
