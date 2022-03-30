import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { getErrorMessage } from 'shared/utils/helpers';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { GenericList } from 'shared/components/GenericList/GenericList';
import './ApplicationServicesDetails.scss';

function ApplicationServiceDetails({ applicationName, serviceName }) {
  useWindowTitle('Application Service');
  const { t, i18n } = useTranslation();
  const resourceUrl = `/apis/applicationconnector.kyma-project.io/v1alpha1/applications/${applicationName}`;

  const { loading = true, error, data: application } = useGet(resourceUrl, {
    pollingInterval: 3000,
  });

  const breadcrumbItems = [
    {
      name: t('applications.title'),
      path: '/',
      fromContext: 'applications',
    },
    {
      name: applicationName,
      path: `/details/${applicationName}`,
      fromContext: 'applications',
    },
    { name: '' },
  ];

  const service = application?.spec.services?.find(
    service => service.name === serviceName,
  );

  if (loading) return <Spinner />;

  if (error) {
    if (error.code === 404) {
      return (
        <ResourceNotFound
          resource={t('applications.title')}
          breadcrumbs={breadcrumbItems}
          i18n={i18n}
        />
      );
    }
    return (
      <ResourceNotFound
        resource={t('applications.title')}
        breadcrumbs={breadcrumbItems}
        customMessage={getErrorMessage(error)}
        i18n={i18n}
      />
    );
  }

  if (!service) {
    return (
      <ResourceNotFound
        resource={t('applications.headers.service')}
        breadcrumbs={breadcrumbItems}
        i18n={i18n}
      />
    );
  }

  const APIs = service?.entries?.filter(t => t.type === 'API');
  const events = service?.entries?.filter(t => t.type === 'Events');

  const headerRenderer = () => [
    t('common.headers.name'),
    t('applications.headers.access-label'),
    t('applications.headers.central-gateway-url'),
  ];
  const rowRenderer = e => [
    e.name || EMPTY_TEXT_PLACEHOLDER,
    e.accessLabel || EMPTY_TEXT_PLACEHOLDER,
    (e.centralGatewayUrl && (
      <CopiableText compact i18n={i18n} textToCopy={e.centralGatewayUrl}>
        <Tooltip content={e.centralGatewayUrl}>
          <p className="central-gateway-url">{e.centralGatewayUrl}</p>
        </Tooltip>
      </CopiableText>
    )) ||
      EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <>
      {application && (
        <>
          <PageHeader
            title={service?.displayName || serviceName}
            breadcrumbItems={breadcrumbItems}
          />

          <GenericList
            key="application-service-apis"
            title={t('applications.headers.apis')}
            textSearchProperties={['name', 'accessLabel', 'centralGatewayUrl']}
            entries={APIs}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            notFoundMessage={t('applications.messages.no-apis')}
            i18n={i18n}
          />

          <GenericList
            key="application-service-events"
            title={t('applications.headers.events')}
            textSearchProperties={['name', 'accessLabel', 'centralGatewayUrl']}
            entries={events}
            headerRenderer={headerRenderer}
            rowRenderer={rowRenderer}
            notFoundMessage={t('applications.messages.no-events')}
            i18n={i18n}
          />
        </>
      )}
    </>
  );
}
export default ApplicationServiceDetails;
