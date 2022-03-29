import React from 'react';
import { FormLabel, Icon } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

export function Label({ required, tooltipContent, children }) {
  return (
    <>
      <FormLabel required={required}>{children}</FormLabel>
      {tooltipContent && (
        <Tooltip className="info-tooltip" delay={0} content={tooltipContent}>
          <Icon ariaLabel="" glyph="question-mark" />
        </Tooltip>
      )}
    </>
  );
}
