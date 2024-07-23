import { FlexBox, Icon, Label } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useState } from 'react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';

export function Title({
  tooltipContent,
  title,
  disabled,
  canChangeState,
  iconGlyph,
  required,
}) {
  const [openPopover, setOpenPopover] = useState(false);

  return (
    <div className="title">
      <FlexBox alignItems="Center">
        {!disabled && canChangeState && iconGlyph && (
          <Icon
            style={spacing.sapUiSmallMarginEnd}
            aria-hidden
            name={iconGlyph}
          />
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
            style={spacing.sapUiTinyMarginBegin}
          />
        )}
      </FlexBox>
    </div>
  );
}
