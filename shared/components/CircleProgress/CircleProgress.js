import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './CircleProgress.scss';

export const CircleProgress = ({
  size = 110,
  value,
  valueText = value,
  max,
  maxText = max,
  color = 'var(--fd-color-action-1)',
  onClick,
  title,
}) => {
  const percent = max ? Math.round((value * 100) / max) : 0;

  const text = valueText + '/' + maxText;
  const textSize = (1.18 / Math.max(4, text.length)) * size + 'px'; // scale the text dynamically basing on a magic number which makes it look good

  const circleProgressClasses = classNames(`circle-progress`, {
    'cursor-pointer': !!onClick,
  });
  const containerStyle = {
    width: size + 'px',
    height: size + 'px',
  };
  const valueIndicatorStyle = {
    backgroundImage: `conic-gradient(transparent ${100 -
      percent}%, ${color} 0)`, // we have to prepare it here to avoid using styledComponents
  };
  const gradientSize = size / 12;
  const backgroundStyle = {
    backgroundImage: `radial-gradient(
          circle at center center,
          ${color},
          transparent
        ),
        repeating-radial-gradient(
          circle at center center,
          ${color},
          ${color},
          ${gradientSize}px,
          transparent ${gradientSize * 2}px,
          transparent ${gradientSize}px
        )`,
  };

  return (
    <div className={circleProgressClasses} onClick={onClick}>
      <span>{title}</span>
      <div className="circle__container" style={containerStyle}>
        <div className="background" style={backgroundStyle}></div>
        <div className="value-indicator" style={valueIndicatorStyle}></div>
        <div className="inner-area">
          <div className="percentage" style={{ fontSize: textSize }}>
            {text}
          </div>
        </div>
      </div>
    </div>
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
};
