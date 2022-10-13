import React from 'react';
import { FormInput } from 'fundamental-react';

export function Number({ value = '', setValue, ...props }) {
  return (
    <div className="fd-col fd-col-md--11">
      <FormInput
        compact
        type="number"
        value={value}
        onChange={e => setValue(e.target.valueAsNumber ?? null)}
        {...props}
      />
    </div>
  );
}

export function Port({ ...props }) {
  return (
    <div className="fd-col fd-col-md--11">
      <Number min={1} max={65535} {...props} />
    </div>
  );
}
