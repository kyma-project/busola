import classnames from 'classnames';
import { FlexBox } from '@ui5/webcomponents-react';
import { Label } from '../../../shared/ResourceForm/components/Label';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';

import './FormField.scss';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { useState } from 'react';
import { spacing } from '@ui5/webcomponents-react-base';

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
      <FlexBox wrap="Wrap" alignItems="Center" className="bsl-col-md--12">
        {!isListItem && <Label required={required && !disabled}>{label}</Label>}
        <div className="tooltip-column">
          {tooltipContent && (
            <HintButton
              setShowTitleDescription={setOpenPopover}
              showTitleDescription={openPopover}
              description={tooltipContent}
              style={spacing.sapUiTinyMarginBegin}
            />
          )}
        </div>
      </FlexBox>
      <FlexBox wrap="Wrap" alignItems="Center">
        <div className="bsl-col-md--12">
          <FlexBox wrap="Wrap" alignItems="Center">
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
              <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
                {inputInfoLink}
              </Label>
            )}
          </FlexBox>
        </div>
      </FlexBox>
    </FlexBox>
  );
}
