import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import './ProgressBar.scss';

const TooltipWrapper = ({ tooltipProps, children }) => {
  if (tooltipProps?.content) {
    return (
      <Tooltip {...tooltipProps} className="progress-bar-tooltip">
        {children}
      </Tooltip>
    );
  }
  return children;
};

export function ProgressBar({
  percentage,
  color = 'var(--sapBrandColor)',
  tooltip,
}) {
  const progressBarStyle = {
    width: percentage,
    backgroundColor: color,
  };

  return (
    <TooltipWrapper tooltipProps={tooltip}>
      <div className="progress-bar-container">
        <div className="progress-bar" style={progressBarStyle} />
      </div>
    </TooltipWrapper>
  );
}

ProgressBar.propTypes = {
  current: PropTypes.number,
  max: PropTypes.number,
  color: PropTypes.string,
  tooltip: PropTypes.object,
};
