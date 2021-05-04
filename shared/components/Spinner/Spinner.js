import React from 'react';

export const Spinner = ({ ariaLabel = 'Loading' }) => {
  return (
    <div
      className="fd-busy-indicator--l fd-margin-top-bottom--md"
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      aria-hidden="false"
      aria-label={ariaLabel}
    >
      <div className="fd-busy-indicator--circle-0"></div>
      <div className="fd-busy-indicator--circle-1"></div>
      <div className="fd-busy-indicator--circle-2"></div>
    </div>
  );
};
