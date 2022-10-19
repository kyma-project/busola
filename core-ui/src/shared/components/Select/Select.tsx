import React from 'react';
import { Select as FdSelect } from 'fundamental-react';
import { SelectProps as FdSelectProps } from 'fundamental-react/lib/Select/Select';

type SelectProps = FdSelectProps & {
  fullWidth?: boolean;
};

export function Select({ fullWidth, ...props }: SelectProps) {
  return (
    <FdSelect
      {...props}
      className={fullWidth ? 'select-full-width' : undefined}
    />
  );
}
