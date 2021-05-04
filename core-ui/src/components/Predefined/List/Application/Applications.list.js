import React from 'react';
import CreateApplicationModal from './CreateApplicationModal';
import { ApplicationStatus } from '../../Details/Application/ApplicationStatus';

export const ApplicationsList = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Status',
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
