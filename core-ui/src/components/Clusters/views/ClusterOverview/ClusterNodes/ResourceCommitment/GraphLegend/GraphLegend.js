import React from 'react';
import { useTranslation } from 'react-i18next';
import './GraphLegend.scss';

export function GraphLegend() {
  const { t } = useTranslation();

  return (
    <legend className="commitment-graph__legend">
      {['requests', 'limits', 'capacity'].map(e => (
        <div key={e}>
          <div className={`legend-box legend-box--${e}`}></div>
          <span>{t(`graphs.resource-commitment.${e}`)}</span>
        </div>
      ))}
    </legend>
  );
}
