import classnames from 'classnames';
import { FlexBox } from '@ui5/webcomponents-react';
import { Label } from './Label';
import { HintButton } from 'shared/components/HintButton/HintButton';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';
import { JSXElementConstructor, ReactElement, useState } from 'react';

import './FormField.scss';

export type FormFieldProps = {
  label?: string;
  input: (props: any) => JSX.Element;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  tooltipContent?: React.ReactNode | string;
  isListItem?: boolean;
  messageStrip?: JSX.Element;
  inputInfo?: string | ReactElement<any, string | JSXElementConstructor<any>>;
  updatesOnInput?: boolean;
  style?: React.CSSProperties;
} & Record<string, any>;

export function FormField({
  label,
  input,
  className,
  required,
  disabled,
  tooltipContent,
  isListItem,
  messageStrip,
  inputInfo,
  updatesOnInput,
  style,
  ...props
}: FormFieldProps) {
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
        <FlexBox
          key={'labels-flexbox'}
          wrap="Wrap"
          alignItems="Center"
          className="bsl-col-md--12"
        >
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
      <FlexBox
        key={'messagestrip-flexbox'}
        wrap="Wrap"
        alignItems="Center"
        className="full-width"
      >
        {messageStrip ||
          input({
            updatesOnInput,
            required,
            disabled,
            className: 'full-width',
            accessibleName: label,
            id: label?.replace(' ', '-').toLowerCase(),
            ...props,
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
