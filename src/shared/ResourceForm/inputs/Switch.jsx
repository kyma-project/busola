import { Switch as UI5Switch } from '@ui5/webcomponents-react';

export function Switch({ value, setValue, ...props }) {
  return (
    <UI5Switch onChange={() => setValue(!value)} checked={value} {...props} />
  );
}
