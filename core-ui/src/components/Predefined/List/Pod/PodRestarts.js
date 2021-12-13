import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

export default function PodRestarts({ statuses }) {
  const { t } = useTranslation();

  const restartCount = statuses?.reduce((acc, c) => acc + c.restartCount, 0);
  const type = restartCount ? 'warning' : 'success';

  const getTooltipContent = () => {
    if (!restartCount) return t('pods.tooltips.no-restarts');
    return (
      <ul style={{ textAlign: 'left' }}>
        {statuses.map(s => (
          <li key={s.name}>{`${s.name}: ${s.restartCount}`}</li>
        ))}
      </ul>
    );
  };

  return (
    <StatusBadge type={type} tooltipContent={getTooltipContent()}>
      {restartCount || 0}
    </StatusBadge>
  );
}
