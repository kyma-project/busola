import React from 'react';
import CreateApplicationModal from './CreateApplicationModal';
import { ApplicationStatus } from '../../Details/Application/ApplicationStatus';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const ApplicationsList = ({ DefaultRenderer, ...otherParams }) => {
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
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      customHeaderActions={<CreateApplicationModal />}
      {...otherParams}
    />
  );
};
