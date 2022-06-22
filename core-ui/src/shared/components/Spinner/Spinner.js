import React from 'react';
export const Spinner = ({
  ariaLabel = 'Loading',
  compact = false,
  className,
}) => {
  return (
    <div
      style={{
        width: '100%%',
        display: 'flex',
        justifyContent: 'center',
      }}
      className={className || `fd-busy-indicator--${compact ? 'm' : 'l'}`}
      aria-hidden="false"
      aria-label={ariaLabel}
    >
      <div className="fd-busy-indicator--circle-0" />
      <div className="fd-busy-indicator--circle-1" />
      <div className="fd-busy-indicator--circle-2" />
    </div>
  );
};
