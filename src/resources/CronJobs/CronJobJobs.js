import React from 'react';
import JobList from 'resources/Jobs/JobList';

export function CronJobJobs(cronJob) {
  const namespace = cronJob.metadata.namespace;
  const jobsUrl = `/apis/batch/v1/namespaces/${namespace}/jobs`;
  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref => ref.kind === 'CronJob' && ref.name === cronJob.metadata.name,
    );

  return (
    <JobList
      key="cronJobJobs"
      {...{
        hasDetailsView: true,
        resourceUrl: jobsUrl,
        resourceType: 'jobs',
        namespace,
        isCompact: true,
        showTitle: true,
        filter: filterByOwnerRef,
        createFormProps: { prefix: cronJob.metadata.name },
      }}
    />
  );
}
