import React from 'react';
import PropTypes from 'prop-types';
import { FormItem, FormLabel } from 'fundamental-react';
import CustomPropTypes from '../../typechecking/CustomPropTypes';

TextFormItem.propTypes = {
  inputKey: PropTypes.string.isRequired,
  required: PropTypes.bool,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.any,
  inputRef: CustomPropTypes.ref,
  className: PropTypes.string,
};

TextFormItem.defaultProps = {
  type: 'text',
};

export function TextFormItem({
  inputKey,
  required,
  label,
  type,
  onChange,
  defaultValue,
  inputRef,
  inputProps,
  className,
}) {
  return (
    <FormItem key={inputKey} className={className}>
      <FormLabel htmlFor={inputKey} required={required}>
        {label}
      </FormLabel>
      <input
        ref={inputRef}
        required={required}
        id={inputKey}
        type={type}
        placeholder={label}
        onChange={onChange}
        autoComplete="off"
        defaultValue={defaultValue}
        {...inputProps}
      />
    </FormItem>
  );
}
