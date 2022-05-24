import React from 'react';

import { Widget } from './Widget';

export function Plain({ value, structure, schema }) {
  console.log('Plain', structure.children);
  return (
    <div>
      {structure.children?.map(def => (
        <Widget value={value} structure={def} schema={schema} />
      ))}
    </div>
  );
}
