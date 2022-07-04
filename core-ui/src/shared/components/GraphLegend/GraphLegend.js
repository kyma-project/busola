import React from 'react';
import { useTranslation } from 'react-i18next';
import './GraphLegend.scss';

export function GraphLegend({ values }) {
  const { t } = useTranslation();
  return (
    <legend className="commitment-graph__legend">
      {values.map(e => (
        <div key={e}>
          <div className={`legend-box legend-box--${e}`}></div>
          <span>{t(`graphs.${e}`)}</span>
        </div>
      ))}
    </legend>
  );
}
