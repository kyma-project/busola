import { forwardRef } from 'react';

export const Input = forwardRef((props, ref) => {
  return <input ref={ref} className="fd-input" type="text" {...props} />;
});
