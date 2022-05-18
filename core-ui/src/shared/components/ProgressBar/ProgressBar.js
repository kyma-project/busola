import React from 'react';
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
  percentage,
  tooltip,
}) {
  const calculatePercentage = (current, max) => {
    const percent = ((current || 0) / (max || current || 1)) * 100;
    if (percent > 100) return 100;
    return percent;
  };
  const getPercentage = (current, max, percentage) =>
    percentage ? percentage : `${calculatePercentage(current, max)}%`;
  const progressBarStyle = {
    width: getPercentage(current, max, percentage),
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
