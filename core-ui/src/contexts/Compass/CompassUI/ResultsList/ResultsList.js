import React, { useRef } from 'react';
import { Link } from 'fundamental-react';
import { useEventListener } from 'hooks/useEventListener';
import { Result } from './Result';
import { addHistoryEntry } from '../search-history';
import './ResultsList.scss';

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
        results[activeIndex].onClick();
      }
    },
    [activeIndex, results, isHistoryMode],
  );

  return (
    <ul className="compass-ui__results" ref={listRef}>
      {results?.length ? (
        results.map((s, i) => (
          <Result
            key={s.label}
            {...s}
            activeIndex={activeIndex}
            index={i}
            setActiveIndex={setActiveIndex}
            onItemClick={() => {
              addHistoryEntry(s.query);
              s.onClick();
              hide();
            }}
          />
        ))
      ) : (
        <Link className="result disabled">
          <p className="label">No results found</p>
          <p className="description">{suggestion}</p>
        </Link>
      )}
    </ul>
  );
}
