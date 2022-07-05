import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './GraphLegend.scss';

export function GraphLegend({ values, isStatsPanel = true }) {
  const { t } = useTranslation();
  const css = useRef();
  const [color, setColor] = useState('');
  const barColors = color.trim().split(/ +/);

  useEffect(() => {
    const canvas = document.querySelector('canvas.stats-graph');

    if (!canvas) return;
    css.current = getComputedStyle(canvas);
    const barColor = css.current.getPropertyValue('--bar-color');
    setColor(barColor);
  }, [values]);

  return (
    <legend className="commitment-graph__legend">
      {values.map((val, idx) => (
        <div key={`${val.metric}-${val?.label}`}>
          <div
            className={classNames(
              'legend-box',
              !isStatsPanel && `legend-box--${val.metric}`,
            )}
            style={
              isStatsPanel
                ? {
                    background: barColors?.[idx],
                  }
                : null
            }
          ></div>
          <span>
            {t(`graphs.${val.metric}`)} {val?.label}
          </span>
        </div>
      ))}
    </legend>
  );
}

GraphLegend.propTypes = {
  isStatsPanel: PropTypes.bool,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      metric: PropTypes.string.isRequired,
      label: PropTypes.string,
    }),
  ),
};
