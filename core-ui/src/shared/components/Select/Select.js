import React from 'react';
import { Select as FdSelect } from 'fundamental-react';

export function Select({ fullWidth, ...props }) {
  if (fullWidth) {
    props.popoverProps = {
      ...props.popoverProps,
      className: `${props.popoverProps?.className} select--full-width`,
    };
  }

  return <FdSelect {...props} />;
}
