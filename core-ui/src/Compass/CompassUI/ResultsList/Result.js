import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
    typeof customActionText === 'string'
      ? customActionText
      : t('compass.item-actions.follow');

  return (
    <li
      ref={resultRef}
      onClick={onItemClick}
      className={index === activeIndex ? 'active' : ''}
    >
      <div className="result">
        <div>
          <p className="label">{label}</p>
          <p className="description">{category}</p>
        </div>
        {activeIndex === index && (
          <p className="fd-has-color-status-4 ">{actionText}</p>
        )}
      </div>
    </li>
  );
}
