import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import ApplicationServices from './ApplicationServices';
import NamespaceBindings from './NamespaceBindings';
import ConnectApplicationModal from './ConnectApplicationModal';
import { ApplicationStatus } from './ApplicationStatus';
import { ApplicationCreate } from './ApplicationCreate';
import { useFeature } from 'shared/hooks/useFeature';

export function ApplicationDetails(props) {
  const { t } = useTranslation();

  const { isEnabled: isAppConnectorFlowEnabled } = useFeature(
    'APPLICATION_CONNECTOR_FLOW',
  );
  const { isEnabled: isServiceCatalogEnabled } = useFeature('SERVICE_CATALOG');

  const customColumns = [
    {
      header: t('applications.headers.description'),
      value: app => app.spec.description || '-',
    },
  ];

  if (isAppConnectorFlowEnabled) {
    customColumns.push({
      header: t('common.headers.status'),
      value: app => <ApplicationStatus application={app} />,
    });
  }

  const customComponents = isServiceCatalogEnabled
    ? [NamespaceBindings, ApplicationServices]
    : [ApplicationServices];

  return (
    <ResourceDetails
      customColumns={customColumns}
      headerActions={
        isAppConnectorFlowEnabled && (
          <ConnectApplicationModal applicationName={props.resourceName} />
        )
      }
      customComponents={customComponents}
      createResourceForm={ApplicationCreate}
      {...props}
    />
  );
}

export default ApplicationDetails;
