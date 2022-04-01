import React from 'react';
import { Icon } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

export function Title({
  tooltipContent,
  title,
  disabled,
  canChangeState,
  iconGlyph,
}) {
  return (
    <div className="title">
      {!disabled && canChangeState && (
        <Icon className="control-icon" ariaHidden glyph={iconGlyph} />
      )}
      <span className="title-content">{title}</span>
      {tooltipContent && (
        <Tooltip className="info-tooltip" delay={0} content={tooltipContent}>
          <Icon ariaLabel="" glyph="question-mark" />
        </Tooltip>
      )}
    </div>
  );
}
