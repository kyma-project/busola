import React from 'react';
import classNames from 'classnames';

export const Spinner = ({
  ariaLabel = 'Loading',
  compact = false,
  size,
  className = 'fd-margin-top-bottom--md',
  center = true,
}) => {
  size = size || (compact ? 'm' : 'l');
  const sizeClassName = 'fd-busy-indicator--' + size;
  const style = center
    ? { width: '100%', display: 'flex', justifyContent: 'center' }
    : {};

  return (
    <div
      className={classNames(sizeClassName, className)}
      style={style}
      aria-hidden="false"
      aria-label={ariaLabel}
    >
      <div className="fd-busy-indicator--circle-0" />
      <div className="fd-busy-indicator--circle-1" />
      <div className="fd-busy-indicator--circle-2" />
    </div>
  );
};
