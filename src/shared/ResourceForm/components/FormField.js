import classnames from 'classnames';
import { Icon } from '@ui5/webcomponents-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Label } from './Label';

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
  isListItem,
  defaultValue,
  messageStrip,
  inputInfo,
  ...props
}) {
  const { validate, ...inputProps } = props;
  const inputInfoLink = useCreateResourceDescription(inputInfo);

  return (
    <div className={classnames('fd-row form-field', className)}>
      {!isListItem && (
        <div className="fd-col fd-col-md--3 form-field__label">
          <Label required={required && !disabled}>{label}</Label>
        </div>
      )}
      <div className="fd-col fd-col-md--8">
        <div className="fd-row">
          {messageStrip
            ? messageStrip
            : input({ required, disabled, ...inputProps })}
          {inputInfo && (
            <p style={{ color: 'var(--sapNeutralTextColor)' }}>
              {inputInfoLink}
            </p>
          )}
        </div>
      </div>
      <div className="fd-col fd-col-md--1 tooltip-column tooltip-column--with-padding">
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
    </div>
  );
}
