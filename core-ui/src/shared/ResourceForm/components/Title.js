import React from 'react';
import { Icon } from 'fundamental-react';
import { Tooltip } from 'react-shared';

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
          <Icon ariaLabel="Tooltip" glyph="question-mark" />
        </Tooltip>
      )}
    </div>
  );
}
