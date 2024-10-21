import React from 'react';

import { Widget } from './Widget';
import { isNil } from 'lodash';

import './InlineDisplay.scss';
import { spacing } from 'shared/helpers/spacing';

export function Columns({ structure, inlineContext, ...props }) {
  const inline = isNil(structure.inline) ? inlineContext : structure.inline;

  const classNames = inline ? 'inline-display' : 'panel-grid';

  return (
    <div className={classNames} style={spacing.sapUiSmallMargin}>
      {(structure.children || []).map(child => (
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
