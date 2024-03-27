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

export const JobList = props => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('jobs.completions'),
      value: job => <JobCompletions job={job} />,
    },
    {
      header: t('common.headers.owner'),
      value: job => (
        <ControlledBy ownerReferences={job.metadata.ownerReferences} />
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
