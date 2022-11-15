import React from 'react';

export function MainFrameRedirection() {
  const isDev = window.location.hostname === 'localhost';
  return isDev ? (
    <p>
      Hi, did you mean to visit the{' '}
      <a href="http://localhost:8889">main frame</a>?
    </p>
  ) : null;
}
