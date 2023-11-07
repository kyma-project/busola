import React from 'react';
import { Switch as UI5Switch } from '@ui5/webcomponents-react';

export function Switch({ value, setValue, ...props }) {
  return (
    <div className="fd-col bsl-col-md--11">
      <UI5Switch onChange={() => setValue(!value)} checked={value} {...props} />
    </div>
  );
}
