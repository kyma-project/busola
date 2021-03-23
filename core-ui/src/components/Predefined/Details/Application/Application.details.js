import React from 'react';
import { Labels } from 'react-shared';

import ApplicationServices from './ApplicationServices';
import NamespaceBindings from './NamespaceBindings';
import ConnectApplicationModal from './ConnectApplicationModal';
import { ApplicationStatus } from './ApplicationStatus';

export const ApplicationsDetails = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Descritpion',
      value: app => app.spec.description || '-',
    },
    {
      header: 'Labels',
      value: app => <Labels labels={app.metadata.labels} />,
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
