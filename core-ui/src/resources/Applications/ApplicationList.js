import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';

import { ApplicationStatus } from './ApplicationStatus';
import { ApplicationCreate } from './ApplicationCreate';

export function ApplicationList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: application => <ApplicationStatus application={application} />,
    },
  ];
  const description = (
    <Trans i18nKey="applications.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/ac-01-application"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={ApplicationCreate}
      {...props}
    />
  );
}
export default ApplicationList;
