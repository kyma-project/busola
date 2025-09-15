import classnames from 'classnames';
import { FlexBox } from '@ui5/webcomponents-react';
import { Label } from './Label';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';
import { useState } from 'react';

import './FormField.scss';

export function FormField({
  propertyPath,
  label,
  input,
  className,
  required,
  disabled,
  tooltipContent,
  isListItem,
  defaultValue,
  messageStrip,
  inputInfo,
  updatesOnInput,
  style,
  ...props
}) {
  const { validate, ...inputProps } = props;
  const inputInfoLink = useCreateResourceDescription(inputInfo);
  const [openPopover, setOpenPopover] = useState(false);

  return (
    <FlexBox
      className={classnames('form-field', className)}
      justifyContent="Center"
      direction="Column"
      style={style}
    >
      {!isListItem && label && (
        <FlexBox wrap="Wrap" alignItems="Center" className="bsl-col-md--12">
          <Label
            forElement={label.replace(' ', '-').toLowerCase()}
            required={required && !disabled}
          >
            {label}
          </Label>
          {tooltipContent && (
            <HintButton
              setShowTitleDescription={setOpenPopover}
              showTitleDescription={openPopover}
              description={tooltipContent}
              className="sap-margin-begin-tiny"
              ariaTitle={!isListItem ? label : ''}
            />
          )}
        </FlexBox>
      )}
      <FlexBox wrap="Wrap" alignItems="Center" className="full-width">
        {messageStrip
          ? messageStrip
          : input({
              updatesOnInput,
              required,
              disabled,
              className: 'full-width',
              accessibleName: label,
              id: label.replace(' ', '-').toLowerCase(),
              ...inputProps,
            })}
        {inputInfo && (
          <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
            {inputInfoLink}
          </Label>
        )}
      </FlexBox>
    </FlexBox>
  );
}
