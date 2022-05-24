import React from 'react';

import { Widget } from './Widget';

export function Columns({ value, structure, schema }) {
  return (
    <div class="panel-grid">
      {
        <Widget
          value={value}
          structure={structure.columns[0] || []}
          schema={schema}
        />
      }
      {
        <Widget
          value={value}
          structure={structure.columns[1] || []}
          schema={schema}
        />
      }
    </div>
  );
}
