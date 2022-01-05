import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'fundamental-react';
import './ResultsList.scss';
import { useEventListener } from 'hooks/useEventListener';
import { Result } from './Result';

function scrollInto(element) {
  element.scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'smooth',
  });
}

export function ResultsList({ results, hide, suggestion }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef();

  useEffect(() => {
    if (activeIndex > results?.length) {
      setActiveIndex(0);
    }
  }, [results, activeIndex]);

  useEventListener(
    'keydown',
    ({ key }) => {
      if (key === 'ArrowDown' && activeIndex < results?.length - 1) {
        setActiveIndex(activeIndex + 1);
        scrollInto(listRef.current.children[activeIndex + 1]);
      } else if (key === 'ArrowUp' && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
        scrollInto(listRef.current.children[activeIndex - 1]);
      } else if (key === 'Enter' && results?.[activeIndex]) {
        results[activeIndex].onClick();
      }
    },
    [activeIndex, results],
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
            hide={hide}
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
