import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import classNames from 'classnames';
import './CircleProgress.scss';

const isInErrorState = (percent, max, reversed) => {
  if (reversed) {
    percent = 100 - percent;
  }

  return max > 0 && percent < 33;
};

const TooltipWrapper = ({ tooltipProps, children }) => {
  if (tooltipProps?.content) {
    return <Tooltip {...tooltipProps}>{children}</Tooltip>;
  }
  return children;
};

export const CircleProgress = ({
  size = 110,
  value,
  valueText = value,
  max,
  maxText = max,
  color = 'var(--sapBrandColor)',
  onClick,
  title,
  reversed = false,
  tooltip,
}) => {
  const percent = max ? Math.round((value * 100) / max) : 0;

  const text = valueText + '/' + maxText;
  const textSize = (1.18 / Math.max(4, text.length)) * size + 'px'; // scale the text dynamically basing on a magic number which makes it look good

  const circleProgressClasses = classNames(`circle-progress`, {
    'cursor-pointer': !!onClick,
  });

  const circleInnerClasses = classNames(`percentage`, {
    'is-error': isInErrorState(percent, max, reversed),
  });

  const containerStyle = {
    width: size + 'px',
    height: size + 'px',
  };
  const valueIndicatorStyle = {
    backgroundColor: `var(--sapContent_ForegroundColor)`,
    backgroundImage: `conic-gradient(transparent ${100 -
      percent}%, ${color} 0)`, // we have to prepare it here to avoid using styledComponents
  };

  const innerStyle = {
    fontSize: textSize,
  };
  const titleStyle = {
    color: isInErrorState(percent, max, reversed) ? color : 'inherit',
  };

  return (
    <TooltipWrapper tooltipProps={tooltip}>
      <div className={circleProgressClasses} onClick={onClick}>
        <span className="title" style={titleStyle}>
          {isInErrorState(percent, max, reversed) && (
            <Icon
              size="s"
              className="fd-margin-end--tiny"
              glyph="error"
              ariaLabel="Error state icon"
            />
          )}
          {title}
        </span>
        <div className="circle__container" style={containerStyle}>
          <div className="value-indicator" style={valueIndicatorStyle}></div>
          <div className="inner-area">
            <div className={circleInnerClasses} style={innerStyle}>
              {text}
            </div>
          </div>
        </div>
      </div>
    </TooltipWrapper>
  );
};

CircleProgress.propTypes = {
  size: PropTypes.number, // a number of pixels to determine the size
  color: PropTypes.string, // a valid CSS color value (e.g. "blue", "#acdc66" or "var(--some-css-var)")
  value: PropTypes.number.isRequired,
  valueText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.number.isRequired,
  maxText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  title: PropTypes.string,
  reversed: PropTypes.bool,
};
