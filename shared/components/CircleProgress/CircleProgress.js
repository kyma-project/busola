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
  const circleClasses = classNames(`circle__container`, {
    'cursor-pointer': !!onClick,
  });

  const percent = max ? Math.round((value * 100) / max) : 0;

  const text = valueText + '/' + maxText;
  const textSize = (1.18 / Math.max(4, text.length)) * size + 'px'; // scale the text dynamically basing on a kind of 'magic number' which makes it look good for any size and text

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
    <div className="circle-progress" onClick={onClick}>
      <span className="cursor-pointer">{title}</span>
      <div className={circleClasses} style={containerStyle}>
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
  color: PropTypes.string, // a valid CSS color value (e.g. "blue", "#acdc66" or "var(--some-css-var)")
  value: PropTypes.number.isRequired,
  valueText: PropTypes.string,
  max: PropTypes.number.isRequired,
  maxText: PropTypes.string,
  onClick: PropTypes.func,
  title: PropTypes.string,
};
