import React from 'react';
import { Switch as FundamentalSwitch } from 'fundamental-react';

export function Switch({ value, setValue, ...props }) {
  return (
    <FundamentalSwitch
      compact
      onChange={e => setValue(!value)}
      checked={value}
      {...props}
    />
  );
}
