import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import {
  Input,
  Ui5CustomEvent,
  InputDomRef,
  InputPropTypes,
} from '@ui5/webcomponents-react';
import { Label } from '../../ResourceForm/components/Label';
import { ComponentProps, useState } from 'react';

export const k8sNamePattern = '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$';

type K8sNameInputProps = {
  id?: string;
  kind: string;
  showLabel?: boolean;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onInput?: (event: Ui5CustomEvent<InputDomRef, never>) => void;
  pattern?: string;
  readOnly?: boolean;
  compact?: boolean;
} & Omit<ComponentProps<typeof Input>, 'onInput'>;

export const K8sNameInput = ({
  id,
  kind,
  showLabel = true,
  label = 'common.labels.name',
  required = true,
  defaultValue,
  value,
  onInput,
  pattern = k8sNamePattern,
  ...props
}: K8sNameInputProps) => {
  console.log(pattern);
  const { t } = useTranslation();
  const [inputValue, setValue] = useState(value || defaultValue || '');
  const [isValid, setIsValid] = useState(true);

  if (!props.readOnly) delete props.readOnly;
  const { className, compact, ...inputProps } = props || {};

  const inputClassName = classnames('full-width', className, {
    'ui5-content-density-compact': compact,
  });

  // Derive the character-level strip pattern from the provided pattern.
  // This allows only characters that could ever appear in a valid name.
  const allowedCharsRegex = /[^a-z0-9-]/g;

  const handleInput: InputPropTypes['onInput'] = (event) => {
    event.preventDefault();
    const { value } = event.target;
    const sanitized = value.replace(allowedCharsRegex, '');
    setValue(sanitized);

    if (onInput) {
      onInput(event);
    }
  };

  const handleBlur = () => {
    setIsValid(new RegExp(pattern).test(inputValue));
  };

  const handleFocus = () => {
    setIsValid(true);
  };

  const input = (
    <Input
      type="Text"
      id={id}
      value={inputValue}
      aria-required={required ? 'true' : 'false'}
      accessibleName={t('components.k8s-name-input.aria-label', {
        resourceType: kind,
      })}
      required={required}
      valueState={!isValid ? 'Negative' : 'None'}
      onInput={handleInput}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...inputProps}
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
  required: PropTypes.bool,
};
