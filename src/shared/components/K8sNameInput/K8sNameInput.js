import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import { useValidation } from 'shared/hooks/useValidation';
import { Input } from '@ui5/webcomponents-react';
import { Label } from '../../../shared/ResourceForm/components/Label';

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
  if (!props.readOnly) delete props.readOnly;
  const { className, compact, ...inputProps } = props || {};

  const inputClassName = classnames('input-full', className, {
    'ui5-content-density-compact': compact,
  });

  const input = (
    <Input
      // ref={_ref}
      type="Text"
      id={id}
      value={value || defaultValue || ''}
      aria-required={required ? 'true' : 'false'}
      aria-label={t('components.k8s-name-input.aria-label', {
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
        <Label required={required} forElement={id}>
          {t(label)}
        </Label>
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
