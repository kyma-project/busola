import { FlexBox, Icon, Label } from '@ui5/webcomponents-react';
import { useState } from 'react';
import { HintButton } from 'shared/components/HintButton/HintButton';

export type TitleProps = {
  tooltipContent?: React.ReactNode;
  title?: string | JSX.Element;
  disabled?: boolean;
  canChangeState?: boolean;
  iconGlyph?: string;
  required?: boolean;
};

export function Title({
  tooltipContent,
  title,
  disabled,
  canChangeState,
  iconGlyph,
  required,
}: TitleProps) {
  const [openPopover, setOpenPopover] = useState(false);

  return (
    <div className="title">
      <FlexBox alignItems="Center">
        {!disabled && canChangeState && iconGlyph && (
          <Icon className="sap-margin-end-small" aria-hidden name={iconGlyph} />
        )}
        <Label
          style={{
            color: 'var(--sapTextColor)',
            fontSize: 'var(--sapFontMediumSize)',
          }}
          required={required}
        >
          {title}
        </Label>
        {tooltipContent && (
          <HintButton
            setShowTitleDescription={setOpenPopover}
            showTitleDescription={openPopover}
            description={tooltipContent}
            className="sap-margin-begin-tiny"
            ariaTitle={title}
          />
        )}
      </FlexBox>
    </div>
  );
}
