import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './CircleProgress.scss';

const colorTresholds = [
  { percent: 0, color: { r: 0xff, g: 0x00, b: 0 } },
  { percent: 50, color: { r: 0xff, g: 0xff, b: 0 } },
  { percent: 100, color: { r: 0x00, g: 0xff, b: 0 } },
];

const getColorForPercentage = (percent, reversed) => {
  if (reversed) {
    percent = 100 - percent;
  }
  for (var i = 1; i < colorTresholds.length - 1; i++) {
    if (percent < colorTresholds[i].percent) {
      break;
    }
  }
  var lower = colorTresholds[i - 1];
  var upper = colorTresholds[i];
  var range = upper.percent - lower.percent;
  var rangepercent = (percent - lower.percent) / range;
  var percentLower = 1 - rangepercent;
  var percentUpper = rangepercent;
  var color = {
    r: Math.floor(lower.color.r * percentLower + upper.color.r * percentUpper),
    g: Math.floor(lower.color.g * percentLower + upper.color.g * percentUpper),
    b: Math.floor(lower.color.b * percentLower + upper.color.b * percentUpper),
  };
  return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
};

export const CircleProgress = ({
  size = 110,
  value,
  valueText = value,
  max,
  maxText = max,
  color = 'var(--fd-color-action-1)',
  onClick,
  title,
  reversed = false,
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
      percent}%, ${getColorForPercentage(percent, reversed)} 0)`, // we have to prepare it here to avoid using styledComponents
  };
  const backgroundStyle = {
    // backgroundColor: `${getColorForPercentage(percent, reversed)}`,

    backgroundColor: `#f0f0f0`,
    opacity: `0.5`,
    // backgroundImage: `radial-gradient(#adadad 0.5px, #f0f0f0 0.5px)`,
    // backgroundSize: `5px 5px`,
  };

  return (
    <div className={circleProgressClasses} onClick={onClick}>
      <span className="title">{title}</span>
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
  reversed: PropTypes.bool,
};
