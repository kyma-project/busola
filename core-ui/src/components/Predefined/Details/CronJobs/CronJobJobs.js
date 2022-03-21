import React from 'react';
import JobsList from 'components/Predefined/List/Jobs.list';
import { useTranslation } from 'react-i18next';

function CronJobJobs(cronJob) {
  const namespace = cronJob.metadata.namespace;
  const jobsUrl = `/apis/batch/v1/namespaces/${namespace}/jobs`;
  const { i18n } = useTranslation();
  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref => ref.kind === 'CronJob' && ref.name === cronJob.metadata.name,
    );

  return (
    <JobsList
      key="cronJobJobs"
      {...{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: jobsUrl,
        resourceType: 'jobs',
        namespace,
        isCompact: true,
        showTitle: true,
        filter: filterByOwnerRef,
        i18n,
      }}
    />
  );
}

export default CronJobJobs;
