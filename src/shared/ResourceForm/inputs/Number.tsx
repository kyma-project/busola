import { Input, InputPropTypes } from '@ui5/webcomponents-react';

type NumberProps = {
  value?: string | number;
  setValue: (value: number | null) => void;
  min?: number;
  max?: number;
} & Omit<InputPropTypes, 'value' | 'onInput'>;

export function Number({ value = '', setValue, ...props }: NumberProps) {
  if (!props.readonly) delete props.readonly;
  return (
    <Input
      type="Number"
      value={String(value)}
      onInput={(e) => {
        const parsed = parseInt(e.target.value);
        setValue(isNaN(parsed) ? null : parsed);
      }}
      {...props}
    />
  );
}

export function Port(props: NumberProps) {
  return <Number min={1} max={65535} {...props} />;
}
