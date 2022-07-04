import React from 'react';

import { Widget } from './Widget';

export function Plain({ value, structure, schema }) {
  return structure.children?.map((def, idx) => (
    <Widget value={value} structure={def} schema={schema} key={idx} />
  ));
}
