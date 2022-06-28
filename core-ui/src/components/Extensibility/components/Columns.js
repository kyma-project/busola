import React from 'react';

import { Widget } from './Widget';

export function Columns({ structure, ...props }) {
  return (
    <div className="panel-grid">
      {structure.children.map(child => (
        <Widget structure={child} {...props} />
      ))}
    </div>
  );
}
