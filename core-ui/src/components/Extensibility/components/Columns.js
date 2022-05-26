import React from 'react';

import { Widget } from './Widget';

export function Columns({ value, structure, schema }) {
  return (
    <div class="panel-grid">
      {structure.children.map(child => (
        <Widget value={value} structure={child} schema={schema} />
      ))}
    </div>
  );
}
