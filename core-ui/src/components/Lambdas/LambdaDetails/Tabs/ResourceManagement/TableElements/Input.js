import React from 'react';

export const Input = ({ _ref = undefined, ...props }) => (
  <input ref={_ref} className="fd-input" type="text" {...props} />
);
