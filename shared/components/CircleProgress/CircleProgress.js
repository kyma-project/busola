import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './CircleProgress.scss';

export const CircleProgress = ({
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
  const textSize = text.length > 4 ? 110 / text.length + 'px' : '1.8em'; // scale the text dynamically only if it's longer than 4 characters to avoid making it too big

  const containerStyle = {
    background: `conic-gradient(transparent ${100 - percent}%, ${color} 0)`, // we have to prepare it here to avoid using styledComponents
  };

  return (
    <div className="circle-progress" onClick={onClick}>
      <span className="cursor-pointer">{title}</span>
      <div className={circleClasses} style={containerStyle}>
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
