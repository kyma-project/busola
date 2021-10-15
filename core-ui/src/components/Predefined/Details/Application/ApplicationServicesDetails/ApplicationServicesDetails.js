import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  GenericList,
  PageHeader,
  YamlEditorProvider,
  useGet,
  ResourceNotFound,
  getErrorMessage,
  Spinner,
  useWindowTitle,
  EMPTY_TEXT_PLACEHOLDER,
} from 'react-shared';

export function ApplicationServiceDetails({ applicationName, serviceName }) {
  useWindowTitle('Application Service');
  const { i18n } = useTranslation();
  const resourceUrl = `/apis/applicationconnector.kyma-project.io/v1alpha1/applications/${applicationName}`;

  const { loading = true, error, data: application } = useGet(resourceUrl, {
    pollingInterval: 3000,
  });

  const breadcrumbItems = [
    {
      name: 'Applications',
      path: '/',
      fromContext: 'applications',
    },
    {
      name: applicationName,
      path: '/',
      fromContext: 'application',
    },
    { name: '' },
  ];

  if (loading) return <Spinner />;
  if (error) {
    if (error.code === 404) {
      return (
        <ResourceNotFound
          resource="Application Service"
          breadcrumbs={breadcrumbItems}
          i18n={i18n}
        />
      );
    }
    return (
      <ResourceNotFound
        resource="Application Service"
        breadcrumbs={breadcrumbItems}
        customMessage={getErrorMessage(error)}
        i18n={i18n}
      />
    );
  }

  const service = application?.spec.services?.find(
    service => service.name === serviceName,
  );
  const APIs = service?.entries?.filter(t => t.type === 'API');
  const events = service?.entries?.filter(t => t.type === 'Events');

  const headerRenderer = () => ['Name', 'Access Label', 'Central Gateway URL'];
  const rowRenderer = e => [
    e.name || EMPTY_TEXT_PLACEHOLDER,
    e.accessLabel || EMPTY_TEXT_PLACEHOLDER,
    e.centralGatewayUrl || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <YamlEditorProvider i18n={i18n}>
      {application && (
        <>
          <PageHeader
            title={service?.displayName || serviceName}
            breadcrumbItems={breadcrumbItems}
          ></PageHeader>

          <GenericList
            key="application-service-apis"
            title={'APIs'}
            textSearchProperties={['name', 'accessLabel', 'centralGatewayUrl']}
            entries={APIs}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            notFoundMessage={'Not Found'}
            i18n={i18n}
          />

          <GenericList
            key="application-service-events"
            title={'Events'}
            textSearchProperties={['name', 'accessLabel', 'centralGatewayUrl']}
            entries={events}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            notFoundMessage={'Not Found'}
            i18n={i18n}
          />
        </>
      )}
    </YamlEditorProvider>
  );
}
