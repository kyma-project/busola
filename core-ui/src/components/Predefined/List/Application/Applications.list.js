import React from 'react';
import CreateApplicationModal from './CreateApplicationModal';
import { ApplicationStatus } from '../../Details/Application/ApplicationStatus';
import { useTranslation } from 'react-i18next';

export const ApplicationsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: application => <ApplicationStatus application={application} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customHeaderActions={<CreateApplicationModal />}
      {...otherParams}
    />
  );
};
