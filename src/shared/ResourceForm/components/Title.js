import { FlexBox, Icon, Label } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

export function Title({
  tooltipContent,
  title,
  disabled,
  canChangeState,
  iconGlyph,
  required,
}) {
  return (
    <div className="title">
      <FlexBox alignItems="Center">
        {!disabled && canChangeState && (
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
          <Tooltip className="has-tooltip" delay={0} content={tooltipContent}>
            <Icon
              name="question-mark"
              design="Information"
              style={spacing.sapUiTinyMarginBegin}
            />
          </Tooltip>
        )}
      </FlexBox>
    </div>
  );
}
