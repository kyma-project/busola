import React from 'react';

import { Widget } from './Widget';

import './InlineDisplay.scss';
import { isNil } from 'lodash';

export function Columns({ structure, ...props }) {
  const inline = isNil(structure.inline)
    ? props.inlineContext
    : structure.inline;

  const classNames = inline ? 'inline-display' : 'panel-grid';

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
