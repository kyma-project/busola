import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { FormInput, FormLabel } from 'fundamental-react';
import { StringInput } from 'react-shared';

const StringListInput = ({
  label,
  list,
  onChange,
  regexp,
  isEditMode,
  placeholder,
}) => {
  const { i18n } = useTranslation();
  return (
    <div className="string-list-input">
      <FormLabel htmlFor={label}>{label}</FormLabel>
      {isEditMode ? (
        <StringInput
          stringList={list}
          onChange={onChange}
          regexp={regexp}
          placeholder={placeholder}
          id={label}
          i18n={i18n}
        />
      ) : (
        (list && list.length && (
          <FormInput readOnly value={list.join(', ')} />
        )) ||
        'None'
      )}
    </div>
  );
};

StringListInput.propTypes = {
  label: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onChange: PropTypes.func.isRequired,
  regexp: PropTypes.instanceOf(RegExp),
  isEditMode: PropTypes.bool.isRequired,
  placeholder: PropTypes.string,
};

export default StringListInput;
