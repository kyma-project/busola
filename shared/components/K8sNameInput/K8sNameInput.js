import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../typechecking/CustomPropTypes';
import { Tooltip } from '../Tooltip/Tooltip';
import { FormLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

const pattern = '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$';
const regex = new RegExp(pattern);

export const isK8SNameValid = name => {
  return regex.test(name);
};

export const K8sNameInput = ({
  _ref,
  id,
  kind,
  showHelp = true,
  label = 'Name',
  required = true,
  defaultValue,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <>
      <FormLabel required={required} htmlFor={id}>
        {label}
      </FormLabel>
      {showHelp && (
        <Tooltip content={t('common.tooltips.k8s-name-input')}>
          <input
            role="input"
            ref={_ref}
            type="text"
            id={id}
            defaultValue={defaultValue}
            placeholder={kind + ' name'}
            aria-required={required ? 'true' : 'false'}
            required={required}
            pattern={pattern}
            {...props}
            className={'fd-input ' + (props?.className || '')}
          />
        </Tooltip>
      )}
      {!showHelp && (
        <input
          role="input"
          ref={_ref}
          type="text"
          id={id}
          defaultValue={defaultValue}
          placeholder={kind + ' name'}
          aria-required={required ? 'true' : 'false'}
          required={required}
          pattern={pattern}
          {...props}
          className={'fd-input ' + (props?.className || '')}
        />
      )}
    </>
  );
};

K8sNameInput.propTypes = {
  _ref: CustomPropTypes.ref,
  id: PropTypes.string,
  kind: PropTypes.string.isRequired,
  showHelp: PropTypes.bool,
  required: PropTypes.bool,
};
