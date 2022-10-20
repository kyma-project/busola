import React from 'react';
import { Select as FdSelect } from 'fundamental-react';

export function Select({ fullWidth, ...props }) {
  if (fullWidth) {
    props.popoverProps = {
      ...props.popoverProps,
      className: `${props.popoverProps?.className} select--full-width`,
    };
  }

  return (
    <div className="fd-col fd-col-md--11">
      <FdSelect {...props} />
    </div>
  );
}
