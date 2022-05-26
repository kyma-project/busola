import React from 'react';
import { useTranslation } from 'react-i18next';

export function GraphLegend() {
  const { t } = useTranslation();

  return (
    <legend className="graph-legend">
      {['requests', 'limits', 'capacity'].map(e => (
        <div key={e}>
          <div className={`legend-box graph-box--${e}`}></div>
          <span>{t(`graphs.resource-commitment.${e}`)}</span>
        </div>
      ))}
    </legend>
  );
}
