import React from 'react';
import { useMicrofrontendContext, ResourceDetails } from 'react-shared';

import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { ComponentForList } from 'shared/getComponents';
import DeployNewWorkload from './DeployNewWorkload';
import { NamespaceStatus } from './NamespaceStatus';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import './Namespace.details.scss';
import { useTranslation } from 'react-i18next';
import { NamespacesCreate } from '../../Create/Namespaces/Namespaces.create';
import LimitRangesList from 'components/Predefined/List/LimitRanges.list';
import ResourceQuotasListComponent from 'components/Predefined/List/ResourceQuotas.list';

export const NamespacesDetails = props => {
  const { t, i18n } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const limitRangesParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${props.resourceName}/limitranges`,
    resourceType: 'LimitRanges',
    namespace: props.resourceName,
    isCompact: true,
    showTitle: true,
    i18n,
  };

  const LimitrangesList = <LimitRangesList {...limitRangesParams} />;

  const resourceQuotasParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${props.resourceName}/resourcequotas`,
    resourceType: 'ResourceQuotas',
    namespace: props.resourceName,
    isCompact: true,
    showTitle: true,
    i18n,
  };

  const ResourceQuotasList = (
    <ResourceQuotasListComponent {...resourceQuotasParams} />
  );

  const applicationMappingsParams = {
    hasDetailsView: false,
    resourceUrl: `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${props.resourceName}/applicationmappings`,
    resourceType: 'ApplicationMappings',
    namespace: props.resourceName,
    isCompact: true,
    showTitle: true,
  };

  // TODO verify if such components exist
  const ApplicationMappings = features?.APPLICATIONS?.isEnabled ? (
    <ComponentForList
      name="applicationMappingsList"
      params={applicationMappingsParams}
    />
  ) : null;

  const Events = (
    <EventsList
      namespace={props.resourceName}
      defaultType={EVENT_MESSAGE_TYPE.WARNING}
    />
  );

  const headerActions = (
    <DeployNewWorkload namespaceName={props.resourceName} />
  );

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: namespace => (
        <NamespaceStatus namespaceStatus={namespace.status} />
      ),
    },
  ];

  return (
    <ResourceDetails
      createResourceForm={NamespacesCreate}
      {...props}
      windowTitle={t('namespaces.overview.title')}
      customColumns={customColumns}
      headerActions={headerActions}
    >
      <div className="panel-grid">
        <NamespaceWorkloads namespace={props.resourceName} />
        <ResourcesUsage namespace={props.resourceName} />
      </div>
      {LimitrangesList}
      {ResourceQuotasList}
      {ApplicationMappings}
      {Events}
    </ResourceDetails>
  );
};
export default NamespacesDetails;
