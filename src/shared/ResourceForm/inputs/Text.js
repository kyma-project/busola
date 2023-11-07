import React from 'react';
import { useValidation } from 'shared/hooks/useValidation';
import { Input } from '@ui5/webcomponents-react';

export function Text(props) {
  return <WrappedText {...props} />;
}

export function WrappedText({ value, setValue, onChange, inputRef, ...props }) {
  if (!props.readOnly) delete props.readOnly;

  const {
    validationRef,
    internalValue,
    setMultiValue,
    setResource,
    validateMessage,
    fullWidth = false,
    ...inputProps
  } = props;

  const validationProps = useValidation({
    inputRef,
    onChange: [onChange, e => setValue && setValue(e.target.value)],
  });

  return (
    <div className={fullWidth ? '' : 'fd-col fd-col-md--11'}>
      <Input
        value={value || ''}
        onInput={e => setValue && setValue(e.target.value)}
        {...inputProps}
        {...validationProps}
      />
    </div>
  );
}
