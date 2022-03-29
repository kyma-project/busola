import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function BTPResourceStatus({ status, resourceKind }) {
  const { i18n } = useTranslation();

  const conditions = status.conditions;
  const lastCondition = conditions[conditions.length - 1];

  if (status.ready === 'True' && lastCondition.type === 'Ready') {
    return (
      <StatusBadge type="positive" i18n={i18n} resourceKind={resourceKind}>
        {lastCondition.reason}
      </StatusBadge>
    );
  }

  const message = conditions.find(c => c.message)?.message || '';
  const type = lastCondition.reason === 'NotProvisioned' ? 'info' : 'error';

  return (
    <StatusBadge
      type={type}
      additionalContent={message}
      i18n={i18n}
      resourceKind={resourceKind}
    >
      {lastCondition.reason}
    </StatusBadge>
  );
}
