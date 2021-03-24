import React from 'react';
import { StatusBadge } from 'react-shared';

export default function PodRestarts({ statuses }) {
  const restartCount = statuses.reduce((acc, c) => acc + c.restartCount, 0);
  const type = restartCount ? 'warning' : 'success';

  const tooltipContent = (() => {
    if (!restartCount) return null;
    return (
      <ul style={{ textAlign: 'left' }}>
        {statuses.map(s => (
          <li key={s.name}>{`${s.name}: ${s.restartCount}`}</li>
        ))}
      </ul>
    );
  })();

  return (
    <StatusBadge type={type} tooltipContent={tooltipContent}>
      {restartCount}
    </StatusBadge>
  );
}
