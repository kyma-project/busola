import React from 'react';
import { StatusBadge, Tooltip } from 'react-shared';

export function ServiceBindingStatus({ serviceBinding }) {
  const conditions = serviceBinding.status.conditions;
  const lastCondition = conditions[conditions.length - 1];

  if (lastCondition.type === 'Ready' && lastCondition.status === 'True') {
    return <StatusBadge type="positive">{lastCondition.reason}</StatusBadge>;
  }

  const message = conditions.find(c => c.message)?.message || '';
  return (
    <Tooltip content={message}>
      <StatusBadge type="negative">{lastCondition.reason}</StatusBadge>
    </Tooltip>
  );
}
