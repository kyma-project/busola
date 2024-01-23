import { ProgressIndicator } from '@ui5/webcomponents-react';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import './ProgressIndicatorWithPercentage.scss';

const TooltipWrapper = ({ tooltipProps, children }) => {
  if (tooltipProps?.content) {
    return <Tooltip {...tooltipProps}>{children}</Tooltip>;
  }
  return children;
};

export const ProgressIndicatorWithPercentage = ({
  title,
  value,
  dataBarColor,
  remainingBarColor,
  tooltip,
}) => {
  const progressRef = useRef(null);
  const dataBar = progressRef.current?.shadowRoot?.querySelector(
    '.ui5-progress-indicator-bar',
  );
  const remainingBar = progressRef.current?.shadowRoot?.querySelector(
    '.ui5-progress-indicator-remaining-bar',
  );

  if (dataBar && remainingBar) {
    dataBar.style['background-color'] = dataBarColor;
    remainingBar.style['background-color'] = remainingBarColor;
  }

  return (
    <TooltipWrapper tooltipProps={tooltip}>
      <div className="progress-indicator-percentage">
        <p className="progress-indicator-percentage__percents">
          {!isNaN(value) ? value : 0}%
        </p>
        <ProgressIndicator
          displayValue={title}
          value={value}
          ref={progressRef}
          className="progress-indicator"
        />
      </div>
    </TooltipWrapper>
  );
};

ProgressIndicatorWithPercentage.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number,
  dataBarColor: PropTypes.string,
  remainingBarColor: PropTypes.string,
  tooltip: PropTypes.object,
};
