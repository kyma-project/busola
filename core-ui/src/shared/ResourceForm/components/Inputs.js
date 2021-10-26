import React from 'react';
import { FormInput, Switch as FRSwitch } from 'fundamental-react';
import { Dropdown as BusolaDropown } from 'react-shared';
import { useTranslation } from 'react-i18next';

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

export function Dropdown({ value, setValue, ...props }) {
  const { i18n } = useTranslation();
  return (
    <BusolaDropown
      compact
      fullWidth
      selectedKey={value}
      onSelect={(_, selected) => setValue(selected.key)}
      i18n={i18n}
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
      onChange={e => setValue(e.target.valueAsNumber || null)}
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

export function Dropdown({ value, setValue, ...props }) {
  const { i18n } = useTranslation();
  return (
    <BusolaDropown
      compact
      fullWidth
      selectedKey={value}
      onSelect={(_, selected) => setValue(selected.key)}
      i18n={i18n}
      {...props}
    />
  );
}

export function Port({ ...props }) {
  return <Number min={0} max={65535} {...props} />;
}
