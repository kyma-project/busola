import React from 'react';
import { FormInput, Switch as FRSwitch } from 'fundamental-react';

export function Text({ value, setValue, ...props }) {
  return (
    <FormInput
      compact
      value={value}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  );
}

export function Number({ value, setValue, ...props }) {
  return (
    <FormInput
      compact
      type="number"
      value={value}
      onChange={e => setValue(e.target.valueAsNumber)}
      {...props}
    />
  );
}

export function Switch({ value, setValue, ...props }) {
  return (
    <FRSwitch
      compact
      onChange={e => setValue(!value)}
      checked={value}
      {...props}
    />
  );
}

export function Port({ ...props }) {
  return <Number min={0} max={65535} {...props} />;
}
