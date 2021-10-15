import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  PageHeader,
  YamlEditorProvider,
  useGet,
  ResourceNotFound,
  getErrorMessage,
  Spinner,
  useWindowTitle,
} from 'react-shared';

export function ApplicationServiceDetails({ applicationName, serviceName }) {
  useWindowTitle('Application Service');
  const { i18n } = useTranslation();
  const resourceUrl = `/apis/applicationconnector.kyma-project.io/v1alpha1/applications/${applicationName}`;

  const { loading = true, error, data: resource } = useGet(resourceUrl, {
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

  return (
    <YamlEditorProvider i18n={i18n}>
      {resource && (
        <PageHeader
          title={serviceName}
          breadcrumbItems={breadcrumbItems}
        ></PageHeader>
      )}
    </YamlEditorProvider>
  );
}
