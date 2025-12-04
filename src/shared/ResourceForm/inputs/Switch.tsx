import { Switch as UI5Switch } from '@ui5/webcomponents-react';

interface SwitchProps {
  value: boolean;
  setValue: (_value: boolean) => void;
}

export function Switch({ value, setValue, ...props }: SwitchProps) {
  return (
    <UI5Switch checked={value} onChange={() => setValue(!value)} {...props} />
  );
}
