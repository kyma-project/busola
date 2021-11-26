import React from 'react';
import { FormInput } from 'fundamental-react';

export function Number({ value, setValue, ...props }) {
  return (
    <FormInput
      compact
      type="number"
      value={value}
      onChange={e => setValue(e.target.valueAsNumber || null)}
      {...props}
    />
  );
}

export function Port({ ...props }) {
  return <Number min={0} max={65535} {...props} />;
}
