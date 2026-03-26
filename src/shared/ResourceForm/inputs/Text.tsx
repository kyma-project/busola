import { Input, InputDomRef, InputPropTypes } from '@ui5/webcomponents-react';

type WrappedTextProps = {
  value?: string;
  setValue?: (value: string) => void;
  onChange?: (e: { target: InputDomRef }) => void;
} & Omit<InputPropTypes, 'value' | 'onInput'>;

export function Text({ key, ...props }: WrappedTextProps & { key?: string }) {
  return <WrappedText key={key} {...props} />;
}

export function WrappedText({
  value,
  setValue,
  onChange,
  ...props
}: WrappedTextProps) {
  if (!props.readonly) delete props.readonly;

  return (
    <Input
      value={value || ''}
      onInput={
        onChange ??
        ((e) =>
          setValue && setValue((e.target as unknown as InputDomRef).value))
      }
      {...props}
    />
  );
}
