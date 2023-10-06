import React from 'react';
import { Input } from '@ui5/webcomponents-react';

export function Number({ value = '', setValue, ...props }) {
  return (
    <div className="fd-col fd-col-md--11">
      <Input
        type="Number"
        value={value}
        onInput={e => setValue(e.target.valueAsNumber ?? null)}
        {...props}
      />
    </div>
  );
}

export function Port({ ...props }) {
  return <Number min={1} max={65535} {...props} />;
}
