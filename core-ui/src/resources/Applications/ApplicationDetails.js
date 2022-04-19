import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import ApplicationServices from './ApplicationServices';
import NamespaceBindings from './NamespaceBindings';
import ConnectApplicationModal from './ConnectApplicationModal';
import { ApplicationStatus } from './ApplicationStatus';
import { ApplicationCreate } from './ApplicationCreate';

export function ApplicationDetails(props) {
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
    <ResourceDetails
      customColumns={customColumns}
      headerActions={
        <ConnectApplicationModal applicationName={props.resourceName} />
      }
      customComponents={[NamespaceBindings, ApplicationServices]}
      createResourceForm={ApplicationCreate}
      {...props}
    />
  );
}

export default ApplicationDetails;
