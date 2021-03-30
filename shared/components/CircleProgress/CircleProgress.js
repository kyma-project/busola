import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './CircleProgress.scss';

export const CircleProgress = ({
  value,
  max,
  color = 'blue',
  onClick,
  title,
}) => {
  const circleClasses = classNames(`circle--${color}`, {
    'cursor-pointer': onClick,
  });

  const percent = max ? Math.round((value * 100) / max) : 0;
  return (
    <div className="circle-progress" onClick={onClick}>
      <span className="cursor-pointer">{title}</span>
      <div className={circleClasses}>
        <div className="progress-bar">
          <div className={`mask--dynamic fill--${percent}`}></div>
          <div className={`mask--permanent`}></div>
        </div>
        <div className="inner-area">
          <div className="percentage">
            {value}/{max}
          </div>
        </div>
      </div>
    </div>
  );
};

CircleProgress.propTypes = {
  color: PropTypes.oneOf(['purple', 'green', 'blue', 'teal']),
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  title: PropTypes.string,
};
