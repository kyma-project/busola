import React from 'react';
import classnames from 'classnames';
import { FlexBox, Icon, FormItem, Label } from '@ui5/webcomponents-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';

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
  const inputInfoLink = useCreateResourceDescription(inputInfo);
  if (compact)
    return input({
      required,
      disabled,
      className: 'input-full',
      ...inputProps,
    });
  return (
    <FlexBox className={classnames('form-field', className)}>
      <div className="fd-col-md--3 form-field__label">
        <Label showColon required={required && !disabled}>
          {label}
        </Label>
      </div>
      <div className="fd-col-md--8">
        <FlexBox wrap="Wrap">
          {messageStrip
            ? messageStrip
            : input({
                required,
                disabled,
                className: 'input-full',
                ...inputProps,
              })}
          {inputInfo && (
            <Label
              wrappingType="Normal"
              style={{ color: 'var(--sapNeutralTextColor)' }}
            >
              {inputInfoLink}
            </Label>
          )}
        </FlexBox>
      </div>
      <div className="fd-col-md--1 tooltip-column tooltip-column--with-padding">
        {tooltipContent && (
          <Tooltip className="has-tooltip" delay={0} content={tooltipContent}>
            <Icon
              aria-label=""
              className="ui5-icon-m"
              name="message-information"
            />
          </Tooltip>
        )}
      </div>
    </FlexBox>
  );
}
