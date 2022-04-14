import React, { useEffect, useRef } from 'react';
import { useEventListener } from 'hooks/useEventListener';
import { Result } from './Result';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { addHistoryEntry } from '../search-history';
import './ResultsList.scss';
import { LOADING_INDICATOR } from '../useSearchResults';
import { useTranslation } from 'react-i18next';

function scrollInto(element) {
  element.scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'smooth',
  });
}

export function ResultsList({
  results,
  suggestion,
  activeIndex,
  setActiveIndex,
  isHistoryMode,
}) {
  const listRef = useRef();
  const { t } = useTranslation();

  const isLoading = results.find(r => r.type === LOADING_INDICATOR);
  results = results.filter(r => r.type !== LOADING_INDICATOR);
  useEffect(() => {
    if (results?.length <= activeIndex) {
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
    <ul className="command-palette-ui__results" ref={listRef}>
      {results?.length ? (
        results.map((result, i) => (
          <Result
            key={result.label + result.category}
            {...result}
            index={i}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onItemClick={() => {
              addHistoryEntry(result.query);
              result.onActivate();
            }}
          />
        ))
      ) : (
        <div className="result result--disabled">
          <p className="label">
            {t('command-palette.results.no-results-found')}
          </p>
          <p className="description">{suggestion}</p>
        </div>
      )}
      {isLoading && <Spinner />}
    </ul>
  );
}
