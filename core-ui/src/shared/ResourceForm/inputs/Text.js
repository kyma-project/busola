import React from 'react';
import { FormInput } from 'fundamental-react';
import { useValidation } from 'react-shared';

export function Text(props) {
  return <WrappedText {...props} />;
}

export function WrappedText({ value, setValue, onChange, ref, ...props }) {
  const validationProps = useValidation({
    ref,
    onChange: [onChange, e => setValue(e.target.value)],
  });

  return (
    <FormInput compact value={value || ''} {...validationProps} {...props} />
  );
}
