import React from 'react';
import { StatusBadge, Tooltip } from 'react-shared';

export default function PodRestarts({ statuses }) {
  const restartCount = statuses.reduce((acc, c) => acc + c.restartCount, 0);

  if (restartCount) {
    const tooltipContent = (
      <ul style={{ textAlign: 'left' }}>
        {statuses.map(s => (
          <li key={s.name}>{`${s.name}: ${s.restartCount}`}</li>
        ))}
      </ul>
    );

    return (
      <Tooltip content={tooltipContent}>
        <StatusBadge type="warning">{restartCount}</StatusBadge>
      </Tooltip>
    );
  } else {
    return <StatusBadge type="success">{restartCount}</StatusBadge>;
  }
}
