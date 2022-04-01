import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export const ServiceBindingStatus = ({ status }) => {
  const { i18n } = useTranslation();
  let type = 'info';
  const lastCondition = status?.conditions[status?.conditions.length - 1];

  if (!status?.conditions?.length) {
    return null;
  }

  if (status?.lastConditionState === 'Ready') type = 'success';
  if (status?.lastConditionState.toUpperCase().includes('ERROR'))
    type = 'error';

  return (
    <StatusBadge
      type={type}
      tooltipContent={lastCondition.message}
      i18n={i18n}
      resourceKind="bindings"
    >
      {status.lastConditionState || 'ready'}
    </StatusBadge>
  );
};
