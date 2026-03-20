import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';

import { JobCompletions } from './JobCompletions';
import JobCreate from './JobCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/Jobs';

interface JobListProps {
  namespace: string;
  resourceUrl: string;
  resourceType: string;
  [key: string]: any;
}
export const JobList = (props: JobListProps) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('jobs.completions'),
      value: (job: Record<string, any>) => <JobCompletions job={job} />,
    },
    {
      header: t('common.headers.owner'),
      value: (job: Record<string, any>) => (
        <ControlledBy
          ownerReferences={job.metadata.ownerReferences}
          namespace={job.metadata.namespace}
        />
      ),
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      description={ResourceDescription}
      {...props}
      createResourceForm={JobCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
};

export default JobList;
