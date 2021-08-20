import React from 'react';
import { StatusBadge, Tooltip } from 'react-shared';

export function ServiceInstanceStatus({ serviceInstance }) {
  const status = serviceInstance.status;
  const conditions = status.conditions;
  const lastCondition = conditions[conditions.length - 1];

  if (status.ready === 'True') {
    return <StatusBadge type="positive">{lastCondition.reason}</StatusBadge>;
  }

  const message = conditions.find(c => c.message).message;
  return (
    <Tooltip content={message}>
      <StatusBadge type="negative">{lastCondition.reason}</StatusBadge>
    </Tooltip>
  );
}
