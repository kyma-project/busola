import React from 'react';

import { Widget } from './Widget';
import './Columns.scss';

export function Columns({ structure, ...props }) {
  return (
    <div className="extensibility-columns">
      {structure.children?.map(child => (
        <Widget structure={child} key={`column-${child.path}`} {...props} />
      ))}
    </div>
  );
}
