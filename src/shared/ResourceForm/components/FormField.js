import classnames from 'classnames';
import { FlexBox, Icon } from '@ui5/webcomponents-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Label } from '../../../shared/ResourceForm/components/Label';

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
  updatesOnInput,
  ...props
}) {
  const { validate, ...inputProps } = props;
  const inputInfoLink = useCreateResourceDescription(inputInfo);

  return (
    <FlexBox className={classnames('form-field', className)}>
      {!isListItem && (
        <div className="bsl-col-md--3 form-field__label">
          <Label required={required && !disabled}>{label}</Label>
        </div>
      )}
      <div className="bsl-col-md--8">
        <FlexBox wrap="Wrap">
          {messageStrip
            ? messageStrip
            : input({
                updatesOnInput,
                required,
                disabled,
                className: 'full-width',
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
      <div className="bsl-col-md--1 tooltip-column tooltip-column--with-padding">
        {tooltipContent && (
          <Tooltip className="has-tooltip" delay={0} content={tooltipContent}>
            <Icon
              aria-label=""
              className="bsl-icon-m"
              name="message-information"
              design="Information"
            />
          </Tooltip>
        )}
      </div>
    </FlexBox>
  );
}
