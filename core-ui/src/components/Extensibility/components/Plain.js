import React from 'react';

import { Widget } from './Widget';

export function Plain({ value, structure, schema }) {
  return (
    <div>
      {structure.children?.map((def, idx) => {
        return (
          <Widget value={value} structure={def} schema={schema} key={idx} />
        );
      })}
    </div>
  );
}
