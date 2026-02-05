import { Input } from '@ui5/webcomponents-react';

export function Text({ key, ...props }) {
  return <WrappedText key={key} {...props} />;
}

export function WrappedText({ value, setValue, onChange, ...props }) {
  if (!props.readOnly) delete props.readOnly;

  return (
    <Input
      value={value || ''}
      onInput={onChange ?? ((e) => setValue && setValue(e.target.value))}
      {...props}
    />
  );
}
