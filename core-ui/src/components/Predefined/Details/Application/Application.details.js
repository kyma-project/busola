import React from 'react';

import ApplicationServices from './ApplicationServices';
import NamespaceBindings from './NamespaceBindings';
import ConnectApplicationModal from './ConnectApplicationModal';
import { ApplicationStatus } from './ApplicationStatus';

export const ApplicationsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Descritpion',
      value: app => app.spec.description || '-',
    },
    {
      header: 'Status',
      value: app => <ApplicationStatus application={app} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      headerActions={
        <ConnectApplicationModal applicationName={otherParams.resourceName} />
      }
      customComponents={[NamespaceBindings, ApplicationServices]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
