import { Widget } from './Widget';
import { isNil } from 'lodash';

import './InlineDisplay.scss';

interface ColumnsProps {
  structure: any;
  inlineContext?: boolean;
  [key: string]: any;
}

export function Columns({ structure, inlineContext, ...props }: ColumnsProps) {
  const inline = isNil(structure.inline) ? inlineContext : structure.inline;

  const classNames = inline ? 'inline-display' : 'panel-grid';

  return (
    <div className={classNames} data-testid="extensibility-columns">
      {(structure.children || []).map((child: any) => (
        <Widget
          structure={child}
          key={`column-${child.path || child.name}`}
          {...props}
        />
      ))}
    </div>
  );
}
