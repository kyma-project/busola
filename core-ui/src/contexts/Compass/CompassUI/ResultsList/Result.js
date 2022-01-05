import React, { useEffect, useRef } from 'react';
import { Link } from 'fundamental-react';

export function Result({
  label,
  onClick,
  category,
  index,
  activeIndex,
  setActiveIndex,
  hide,
}) {
  const resultRef = useRef();

  const mouseOver = () => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    resultRef.current.addEventListener('mousemove', mouseOver);
    return () => resultRef.current.removeEventListener('mouseover', mouseOver);
  }, [index, activeIndex, setActiveIndex]);

  if (onClick) {
    return (
      <li
        ref={resultRef}
        onClick={() => {
          onClick();
          hide();
        }}
        className={index === activeIndex ? 'active' : ''}
      >
        <Link className="result">
          <p className="label">{label}</p>
          <p className="description">{category}</p>
        </Link>
      </li>
    );
  }
  return label;
}
