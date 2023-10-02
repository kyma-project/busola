import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function BTPResourceStatus({ status, resourceKind }) {
  const conditions = status?.conditions || [];
  const lastCondition = conditions[conditions.length - 1] || {};

  if (status?.ready === 'True' && lastCondition.type === 'Ready') {
    return (
      <StatusBadge type="Success" resourceKind={resourceKind}>
        {lastCondition.reason}
      </StatusBadge>
    );
  }

  const message = conditions.find(c => c.message)?.message || '';
  const type =
    lastCondition.reason === 'NotProvisioned' ? 'Information' : 'Error';

  return (
    <StatusBadge
      type={type}
      additionalContent={message}
      resourceKind={resourceKind}
    >
      {lastCondition.reason}
    </StatusBadge>
  );
}
