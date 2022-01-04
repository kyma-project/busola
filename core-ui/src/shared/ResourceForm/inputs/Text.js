import React from 'react';
import { FormInput } from 'fundamental-react';
import './Text.scss';

export function Text({ value, setValue, error, ...props }) {
  // console.log(error);
  const getValidationState = () => {
    if (error) {
      return {
        state: 'error',
        text: error.message,
      };
    } else {
      return null;
    }
  };
  return (
    <FormInput
      compact
      value={value || ''}
      onChange={e => setValue(e.target.value)}
      // validationState={getValidationState()}
      // className={error ? 'is-invalid' : ''}
      {...props}
    />
  );
}
