import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function CronJobPods(cronJob) {
  const namespace = cronJob.metadata.namespace;
  const jobsUrl = '/apis/batch/v1/namespaces/default/jobs';

  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref => ref.kind === 'CronJob' && ref.name === cronJob.metadata.name,
    );

  return (
    <ComponentForList
      name="jobsList"
      key="cron-job-jobs"
      params={{
        hasDetailsView: false,
        fixedPath: true,
        resourceUrl: jobsUrl,
        resourceType: 'jobs',
        namespace,
        isCompact: true,
        showTitle: true,
        filter: filterByOwnerRef,
      }}
    />
  );
}
