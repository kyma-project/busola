import React from 'react';
import classnames from 'classnames';
import { Icon } from 'fundamental-react';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import { Label } from './Label';
import './FormField.scss';

export function FormField({
  simple,
  advanced,
  propertyPath,
  label,
  input,
  className,
  required,
  disabled,
  tooltipContent,
  isAdvanced,
  defaultValue,
  messageStrip,
  compact = false,
  inputInfo,
  ...props
}) {
  const { validate, ...inputProps } = props;
  if (compact) return input({ required, disabled, ...inputProps });

  return (
    <div className={classnames('fd-row form-field', className)}>
      <div className="fd-col fd-col-md--3 form-field__label">
        <Label required={required && !disabled}>{label}</Label>
      </div>
      <div className="fd-col fd-col-md--8">
        {messageStrip
          ? messageStrip
          : input({ required, disabled, ...inputProps })}
        {inputInfo && (
          <p style={{ color: 'var(--sapNeutralTextColor)' }}>{inputInfo}</p>
        )}
      </div>
      <div className="fd-col fd-col-md--1 tooltip-column">
        {tooltipContent && (
          <Tooltip className="has-tooltip" delay={0} content={tooltipContent}>
            <Icon ariaLabel="" size="m" glyph="message-information" />
          </Tooltip>
        )}
      </div>
    </div>
  );
}
