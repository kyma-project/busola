import React from 'react';

import { StatusBadge } from 'react-shared';

export const ServiceInstanceStatus = ({ instance }) => {
  let type = 'info';
  const lastCondition =
    instance.status?.conditions[instance.status?.conditions.length - 1];

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
    <StatusBadge type={type} tooltipContent={lastCondition.message}>
      {lastCondition.reason || 'ready'}
    </StatusBadge>
  );
};
