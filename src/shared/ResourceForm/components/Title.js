import React from 'react';
import { Icon } from '@ui5/webcomponents-react';
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
        <Icon className="control-icon" aria-hidden name={iconGlyph} />
      )}
      <span className="title-content">{title}</span>
      {tooltipContent && (
        <Tooltip className="has-tooltip" delay={0} content={tooltipContent}>
          <Icon name="question-mark" />
        </Tooltip>
      )}
    </div>
  );
}
