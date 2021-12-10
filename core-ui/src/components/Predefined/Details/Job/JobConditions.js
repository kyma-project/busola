import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  GenericList,
  ReadableCreationTimestamp,
  StatusBadge,
} from 'react-shared';

export function JobConditions(job) {
  const { t, i18n } = useTranslation();

  const headerRenderer = () => [
    t('jobs.conditions.type'),
    t('jobs.conditions.status'),
    t('jobs.conditions.last-probe'),
    t('jobs.conditions.last-transition'),
  ];
  const conditionTypeStatus = type => {
    if (type === 'Complete') {
      return 'success';
    } else if (type === 'Failed') {
      return 'error';
    } else {
      return 'info';
    }
  };
  const rowRenderer = condition => {
    return [
      <StatusBadge
        noTooltip={condition.type === 'Complete'}
        additionalContent={condition.message}
        type={conditionTypeStatus(condition.type)}
      >
        {condition.type}
      </StatusBadge>,
      condition.status,
      <ReadableCreationTimestamp timestamp={condition.lastProbeTime} />,
      <ReadableCreationTimestamp timestamp={condition.lastTransitionTime} />,
    ];
  };

  return (
    <GenericList
      key="conditions"
      title={t('jobs.conditions.title')}
      showSearchField={false}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={job.status.conditions || []}
      i18n={i18n}
    />
  );
}
