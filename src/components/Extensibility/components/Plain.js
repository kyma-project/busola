import React from 'react';

import { Widget } from './Widget';

export function Plain({ structure, ...props }) {
  return structure.children?.map((def, idx) => (
    <Widget structure={def} {...props} key={idx} />
  ));
}
