import { ProgressIndicator } from '@ui5/webcomponents-react';
import PropTypes from 'prop-types';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import './ProgressIndicatorWithPercentage.scss';

const TooltipWrapper = ({ tooltipProps, children }) => {
  if (tooltipProps?.content) {
    return <Tooltip {...tooltipProps}>{children}</Tooltip>;
  }
  return children;
};

export const ProgressIndicatorWithPercentage = ({
  value,
  dataBarColor,
  remainingBarColor,
  tooltip,
  leftTitle,
  rightTitle,
  accessibleName = 'Progress indicator',
}) => {
  const applyColors = (progressRef) => {
    const dataBar = progressRef?.shadowRoot?.querySelector(
      '.ui5-progress-indicator-bar',
    );
    const remainingBar = progressRef?.shadowRoot?.querySelector(
      '.ui5-progress-indicator-remaining-bar',
    );

    if (dataBar && remainingBar) {
      dataBar.style['background-color'] = dataBarColor;
      remainingBar.style['background-color'] = remainingBarColor;
    }
  };

  const tooltipProps = { ...tooltip, style: { width: '100%' } };

  return (
    <TooltipWrapper tooltipProps={tooltipProps}>
      <div className="progress-indicator-percentage">
        {rightTitle && (
          <p className="progress-indicator-percentage__percents">
            {rightTitle}
          </p>
        )}
        <ProgressIndicator
          accessibleName={accessibleName}
          displayValue={leftTitle}
          value={value}
          ref={(progress) => applyColors(progress)}
          className="progress-indicator"
          style={{ position: 'relative', zIndex: '0' }}
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
  leftTitle: PropTypes.string,
  rightTitle: PropTypes.string,
};
