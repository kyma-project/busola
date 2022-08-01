import React from 'react';

import { Widget } from './Widget';

import './InlineDisplay.scss';

export function InlineDisplay({ structure, ...props }) {
  return (
    <div className="inline-display">
      {structure.children?.map(child => (
        <Widget
          structure={child}
          key={`display-${child.path || child.name}`}
          disableMargin={true}
          {...props}
        />
      ))}
    </div>
  );
}
