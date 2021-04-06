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
  return (
    <div className="circle-progress" onClick={onClick}>
      <span className="cursor-pointer">{title}</span>
      <div className={circleClasses}>
        <div className="progress-bar" style={{ backgroundColor: color }}>
          <div className={`mask--dynamic fill--${percent}`}></div>
          <div className={`mask--permanent`}></div>
        </div>
        <div className="inner-area">
          <div className="percentage">
            {valueText}/{maxText}
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
