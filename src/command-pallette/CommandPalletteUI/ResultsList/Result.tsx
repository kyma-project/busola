import React, { useCallback, useEffect, useRef } from 'react';
import { Trans } from 'react-i18next';
import './Result.scss';

type ResultProps = {
  label: string;
  category: string;
  customActionText: string;
  index: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onItemClick: () => void;
  aliases?: string[];
};

export function Result({
  label,
  category,
  customActionText,
  index,
  activeIndex,
  setActiveIndex,
  onItemClick,
  aliases,
}: ResultProps) {
  const resultRef = useRef<HTMLLIElement | null>(null);

  const onMouseOver = useCallback(() => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [index, activeIndex, setActiveIndex]);

  useEffect(() => {
    const target = resultRef.current!;
    target.addEventListener('mousemove', onMouseOver);
    return () => target.removeEventListener('mousemove', onMouseOver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, activeIndex, setActiveIndex]);

  const actionText =
    typeof customActionText === 'string' ? (
      customActionText
    ) : (
      <Trans i18nKey="command-palette.item-actions.navigate">
        <pre className="key"></pre>
        <pre className="key"></pre>
      </Trans>
    );

  return (
    <li
      ref={resultRef}
      onClick={onItemClick}
      className={index === activeIndex ? 'active' : ''}
    >
      <div className="result">
        <div>
          <p className="label">{label}</p>
          {aliases?.map(alias => (
            <p className="key" key={alias}>
              {alias}
            </p>
          ))}

          <p className="description">{category}</p>
        </div>
        {activeIndex === index && (
          <div className="bsl-has-color-status-4 ">{actionText}</div>
        )}
      </div>
    </li>
  );
}
