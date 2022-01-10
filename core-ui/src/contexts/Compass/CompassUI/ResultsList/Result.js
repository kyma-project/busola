import React, { useCallback, useEffect, useRef } from 'react';

export function Result({
  label,
  category,
  customActionText,
  index,
  activeIndex,
  setActiveIndex,
  onItemClick,
}) {
  const resultRef = useRef();

  const onMouseOver = useCallback(() => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [index, activeIndex, setActiveIndex]);

  useEffect(() => {
    const target = resultRef.current;
    target.addEventListener('mousemove', onMouseOver);
    return () => target.removeEventListener('mousemove', onMouseOver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, activeIndex, setActiveIndex]);

  const actionText =
    typeof customActionText === 'string' ? customActionText : 'Follow';

  return (
    <li
      ref={resultRef}
      onClick={onItemClick ? onItemClick : alert}
      className={index === activeIndex ? 'active' : ''}
    >
      <div className="result">
        <div>
          <p>{label}</p>
          <p className="description">{category}</p>
        </div>
        {activeIndex === index && (
          <p className="fd-has-color-status-4 ">{actionText}</p>
        )}
      </div>
    </li>
  );
}
