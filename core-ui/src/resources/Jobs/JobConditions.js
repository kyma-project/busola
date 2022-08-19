import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { GenericList } from 'shared/components/GenericList/GenericList';

export function JobConditions(job) {
  const { t } = useTranslation();
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
        resourceKind="jobs"
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
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={job.status?.conditions || []}
      searchSettings={{
        showSearchField: false,
      }}
    />
  );
}
