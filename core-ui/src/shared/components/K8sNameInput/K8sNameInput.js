import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import { useValidation } from 'shared/hooks/useValidation';

export const k8sNamePattern = '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$';

export const K8sNameInput = ({
  _ref,
  id,
  kind,
  showHelp = true,
  showLabel = true,
  label = 'common.labels.name',
  required = true,
  defaultValue,
  value,
  onChange,
  inputRef,
  pattern = k8sNamePattern,
  ...props
}) => {
  const { t } = useTranslation();
  const validationProps = useValidation({
    inputRef,
    onChange,
  });

  const { className, compact, ...inputProps } = props || {};

  const inputClassName = classnames('fd-input', className, {
    'fd-input--compact': compact,
  });

  const input = (
    <FormInput
      ref={_ref}
      type="text"
      id={id}
      value={value || defaultValue || ''}
      aria-required={required ? 'true' : 'false'}
      ariaLabel={t('components.k8s-name-input.aria-label', {
        resourceType: kind,
      })}
      required={required}
      pattern={pattern}
      {...inputProps}
      {...validationProps}
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
      {input}
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
