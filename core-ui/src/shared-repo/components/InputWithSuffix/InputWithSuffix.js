import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from './../../typechecking/CustomPropTypes';
import './InputWithSuffix.scss';

export const InputWithSuffix = ({ suffix, required, _ref, ...props }) => {
  return (
    <div className="input-with-suffix">
      <input
        className="fd-input"
        required={required}
        type="text"
        ref={_ref}
        aria-required={required}
        {...props}
      />
      <span className="input-with-suffix__suffix">{suffix}</span>
    </div>
  );
};

InputWithSuffix.propTypes = {
  suffix: PropTypes.string.isRequired,
  required: PropTypes.bool,
  _ref: CustomPropTypes.ref,
};

InputWithSuffix.defaultProps = {
  required: false,
};
