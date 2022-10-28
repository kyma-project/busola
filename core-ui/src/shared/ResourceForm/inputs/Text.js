import React from 'react';
import { FormInput } from 'fundamental-react';
import { useValidation } from 'shared/hooks/useValidation';

export function Text(props) {
  return <WrappedText {...props} />;
}

export function WrappedText({ value, setValue, onChange, inputRef, ...props }) {
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
      <FormInput
        compact
        value={value || ''}
        {...inputProps}
        {...validationProps}
      />
    </div>
  );
}
