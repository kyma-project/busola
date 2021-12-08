import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const ServiceInstanceStatus = ({ instance }) => {
  const { i18n } = useTranslation();
  let type = 'info';
  const lastCondition =
    instance.status?.conditions[instance.status?.conditions.length - 1];

  if (!lastCondition) {
    return null;
  }

  if (
    instance.status?.lastConditionState === 'Ready' &&
    instance.status?.provisionStatus === 'Provisioned'
  )
    type = 'success';
  if (
    lastCondition.reason.toUpperCase().includes('ERROR') ||
    instance.status?.lastConditionState === 'Failed'
  )
    type = 'error';

  return (
    <StatusBadge
      type={type}
      tooltipContent={lastCondition.message}
      i18n={i18n}
      resourceKind="instances"
    >
      {lastCondition.reason || 'ready'}
    </StatusBadge>
  );
};
