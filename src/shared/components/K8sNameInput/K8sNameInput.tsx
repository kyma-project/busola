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
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState(true);

  if (!props.readOnly) delete props.readOnly;
  const { className, compact, ...inputProps } = props || {};

  const inputClassName = classnames('full-width', className, {
    'ui5-content-density-compact': compact,
  });

  const allowedCharsRegex = /[^a-z0-9-]/g;

  const handleInput: InputPropTypes['onInput'] = (event) => {
    const target = event.target as any;
    const currentValue = target.value;

    if (pattern !== '.*') {
      const sanitized = currentValue.replace(allowedCharsRegex, '');
      if (currentValue !== sanitized) {
        target.value = sanitized;
      }
    }

    if (onInput) {
      onInput(event);
    }
  };

  const handleBlur: InputPropTypes['onBlur'] = (event) => {
    setIsValid(new RegExp(pattern).test((event.target as any).value));
  };

  const handleFocus = () => {
    setIsValid(true);
  };

  const input = (
    <Input
      type="Text"
      id={id}
      value={value !== undefined ? value : defaultValue || ''}
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
