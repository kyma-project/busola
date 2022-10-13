import React from 'react';
import { Switch as FundamentalSwitch } from 'fundamental-react';

export function Switch({ value, setValue, ...props }) {
  return (
    <div className="fd-col fd-col-md--11">
      <FundamentalSwitch
        compact
        onChange={e => setValue(!value)}
        checked={value}
        {...props}
      />
    </div>
  );
}
