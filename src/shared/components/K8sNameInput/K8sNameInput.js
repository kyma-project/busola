import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import { useValidation } from 'shared/hooks/useValidation';
import { Input } from '@ui5/webcomponents-react';
import { Label } from '../../../shared/ResourceForm/components/Label';

export const k8sNamePattern = '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$';

export const K8sNameInput = ({
  id,
  kind,
  showHelp = true,
  showLabel = true,
  label = 'common.labels.name',
  required = true,
  defaultValue,
  value,
  onChange,
  onInput,
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

  const inputClassName = classnames('full-width', className, {
    'ui5-content-density-compact': compact,
  });

  const input = (
    <Input
      type="Text"
      id={id}
      value={value || defaultValue || ''}
      aria-required={required ? 'true' : 'false'}
      aria-label={t('components.k8s-name-input.aria-label', {
        resourceType: kind,
      })}
      required={required}
      pattern={pattern}
      onInput={onInput}
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
  id: PropTypes.string,
  kind: PropTypes.string.isRequired,
  showHelp: PropTypes.bool,
  required: PropTypes.bool,
};
