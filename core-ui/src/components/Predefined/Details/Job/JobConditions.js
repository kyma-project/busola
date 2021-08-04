import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList, ReadableCreationTimestamp } from 'react-shared';

export function JobConditions(job) {
  const { t } = useTranslation();

  if (!job.status.conditions) {
    return <></>;
  }

  const headerRenderer = () => [
    t('jobs.conditions.type'),
    t('jobs.conditions.status'),
    t('jobs.conditions.last-probe'),
    t('jobs.conditions.last-transition'),
  ];
  const rowRenderer = condition => {
    return [
      condition.type,
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
      entries={job.status.conditions}
    />
  );
}
