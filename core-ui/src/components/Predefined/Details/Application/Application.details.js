import React from 'react';

import ApplicationServices from './ApplicationServices';
import NamespaceBindings from './NamespaceBindings';
import ConnectApplicationModal from './ConnectApplicationModal';
import { ApplicationStatus } from './ApplicationStatus';
import { useTranslation } from 'react-i18next';

export const ApplicationsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('applications.headers.description'),
      value: app => app.spec.description || '-',
    },
    {
      header: t('common.headers.status'),
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
