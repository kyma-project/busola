import React from 'react';
import { ApplicationStatus } from '../../Details/Application/ApplicationStatus';
import { useTranslation } from 'react-i18next';
import { Link, ResourcesList } from 'react-shared';
import { Trans } from 'react-i18next';
import { ApplicationsCreate } from '../../Create/Applications/Applications.create';

const ApplicationsList = props => {
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
      createResourceForm={ApplicationsCreate}
      {...props}
    />
  );
};
export default ApplicationsList;
