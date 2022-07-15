import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTheme } from 'shared/contexts/ThemeContext';
import './GraphLegend.scss';

export function GraphLegend({ values, isStatsPanel = true }) {
  const { t } = useTranslation();
  const [colors, setColors] = useState([]);
  const { theme } = useTheme();

  const handleCss = () => {
    const canvas = document.querySelector('canvas.stats-graph');
    if (!canvas) return;
    const css = getComputedStyle(canvas);
    const color = css.getPropertyValue('--bar-color');
    setColors(color?.trim().split(/ +/));
  };

  useEffect(() => {
    handleCss();
  }, [values]);

  useEffect(() => {
    const cssDelay = setTimeout(handleCss, 1000);

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
                    background: colors?.[idx],
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
