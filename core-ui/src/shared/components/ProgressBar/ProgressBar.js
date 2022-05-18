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
  current,
  max,
  color = 'var(--sapBrandColor)',
  tooltip,
}) {
  const getPercentage = (current, max) => {
    const percentage = ((current || 0) / (max || current || 1)) * 100;
    if (percentage > 100) return 100;
    return `${percentage}%`;
  };

  const progressBarStyle = {
    width: getPercentage(current, max),
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
  current: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  color: PropTypes.string,
  tooltip: PropTypes.object,
};
