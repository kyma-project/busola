import { Input, InputDomRef, InputPropTypes } from '@ui5/webcomponents-react';

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
      onInput={(e) =>
        setValue(parseInt((e.target as unknown as InputDomRef).value) ?? null)
      }
      {...props}
    />
  );
}

export function Port(props: NumberProps) {
  return <Number min={1} max={65535} {...props} />;
}
