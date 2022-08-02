import React from 'react';

import { Widget } from './Widget';
import { widgets } from '.';

import './InlineDisplay.scss';

export function Columns({ structure, ...props }) {
  let classNames = 'panel-grid';
  if (Array.isArray(structure.children)) {
    if (structure.children.every(child => widgets[child?.widget]?.inline)) {
      classNames = 'inline-display';
    }
  }

  return (
    <div className={classNames}>
      {structure.children?.map(child => (
        <Widget
          structure={child}
          key={`column-${child.path || child.name}`}
          disableMargin={true}
          {...props}
        />
      ))}
    </div>
  );
}
