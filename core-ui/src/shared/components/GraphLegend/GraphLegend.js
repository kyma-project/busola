import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTheme } from 'shared/contexts/ThemeContext';
import './GraphLegend.scss';

export function GraphLegend({ values, isStatsPanel = true }) {
  const { t } = useTranslation();
  const [color, setColor] = useState('');
  const barColors = color?.trim().split(/ +/);
  const { theme } = useTheme();

  const handleCss = canvas => {
    const css = getComputedStyle(canvas);
    const barColor = css.getPropertyValue('--bar-color');
    setColor(barColor);
  };

  useEffect(() => {
    const canvas = document.querySelector('canvas.stats-graph');
    if (!canvas) return;

    handleCss(canvas);
  }, [values]);

  useEffect(() => {
    const canvas = document.querySelector('canvas.stats-graph');
    if (!canvas) return;

    const cssDelay = setTimeout(() => handleCss(canvas), 750);

    return () => clearTimeout(cssDelay);
  }, [theme]);

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
