import { Switch as UI5Switch } from '@ui5/webcomponents-react';

export function Switch({ value, setValue, ...props }) {
  return (
    <div className="bsl-col-md--12">
      <UI5Switch onChange={() => setValue(!value)} checked={value} {...props} />
    </div>
  );
}
