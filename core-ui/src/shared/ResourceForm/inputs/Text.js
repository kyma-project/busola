import React from 'react';
import { FormInput } from 'fundamental-react';

export function Text({ value, setValue, ...props }) {
  return (
    <FormInput
      compact
      value={value || ''}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  );
}
