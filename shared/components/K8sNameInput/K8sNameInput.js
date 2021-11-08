import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../typechecking/CustomPropTypes';
import { Tooltip } from '../Tooltip/Tooltip';
import { FormLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

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
  showLabel = true,
  label = 'common.labels.name',
  required = true,
  defaultValue,
  i18n,
  value,
  ...props
}) => {
  const { t } = useTranslation(null, { i18n });

  const { className, compact, ...inputProps } = props || {};

  const inputClassName = classnames('fd-input', className, {
    'fd-input--compact': compact,
  });

  const input = (
    <input
      role="input"
      ref={_ref}
      type="text"
      id={id}
      defaultValue={defaultValue || value}
      placeholder={t('components.k8s-name-input.placeholder', {
        resourceType: kind,
      })}
      aria-required={required ? 'true' : 'false'}
      required={required}
      pattern={pattern}
      {...inputProps}
      className={inputClassName}
    />
  );

  return (
    <>
      {showLabel && (
        <FormLabel required={required} htmlFor={id}>
          {t(label)}
        </FormLabel>
      )}
      {showHelp ? (
        <Tooltip content={t('common.tooltips.k8s-name-input')}>{input}</Tooltip>
      ) : (
        input
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

export const k8sNamePattern = pattern;
