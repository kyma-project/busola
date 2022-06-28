import React from 'react';

import { Widget } from './Widget';

export function Plain({ structure, ...props }) {
  return (
    <div>
      {structure.children?.map((def, idx) => {
        return <Widget structure={def} {...props} key={idx} />;
      })}
    </div>
  );
}
