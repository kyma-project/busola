import React from 'react';
import { StatusBadge, Tooltip } from 'react-shared';

export function BTPResourceStatus({ status }) {
  const conditions = status.conditions;
  const lastCondition = conditions[conditions.length - 1];

  if (status.ready === 'True' && lastCondition.type === 'Ready') {
    return <StatusBadge type="positive">{lastCondition.reason}</StatusBadge>;
  }

  const message = conditions.find(c => c.message)?.message || '';
  const type = lastCondition.reason === 'NotProvisioned' ? 'info' : 'error';

  return (
    <Tooltip content={message}>
      <StatusBadge type={type}>{lastCondition.reason}</StatusBadge>
    </Tooltip>
  );
}
