import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { LimitRangeList } from 'resources/LimitRanges/LimitRangeList';
import { ResourceQuotaList as ResourceQuotaListComponent } from 'resources/ResourceQuotas/ResourceQuotaList';
import { YamlUploadDialog } from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

import DeployNewWorkload from './DeployNewWorkload';
import { NamespaceStatus } from './NamespaceStatus';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import { NamespaceCreate } from './NamespaceCreate';

import './NamespaceDetails.scss';

export function NamespaceDetails(props) {
  const { t, i18n } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
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

  const LimitrangesList = <LimitRangeList {...limitRangesParams} />;

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
    <ResourceQuotaListComponent {...resourceQuotasParams} />
  );

  const applicationMappingsParams = {
    hasDetailsView: false,
    resourceUrl: `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${props.resourceName}/applicationmappings`,
    resourceType: 'ApplicationMappings',
    namespace: props.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const ApplicationMappings =
    features?.APPLICATIONS?.isEnabled &&
    features?.SERVICE_CATALOG?.isEnabled ? (
      <ResourcesList {...applicationMappingsParams} />
    ) : null;

  const Events = (
    <EventsList
      namespace={props.resourceName}
      defaultType={EVENT_MESSAGE_TYPE.WARNING}
    />
  );

  const headerActions = (
    <>
      <DeployNewWorkload namespaceName={props.resourceName} />
      <Button
        glyph="add"
        onClick={() => {
          setShowAdd(true);
          LuigiClient.uxManager().addBackdrop();
        }}
      >
        {t('upload-yaml.title')}
      </Button>
    </>
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
      createResourceForm={NamespaceCreate}
      {...props}
      windowTitle={t('namespaces.overview.title')}
      customColumns={customColumns}
      headerActions={headerActions}
    >
      <div className="panel-grid">
        <NamespaceWorkloads namespace={props.resourceName} />
        <ResourcesUsage namespace={props.resourceName} />
      </div>
      <StatsPanel type="pod" namespace={props.resourceName} />
      {LimitrangesList}
      {ResourceQuotasList}
      {ApplicationMappings}
      {Events}
      <YamlUploadDialog
        show={showAdd}
        onCancel={() => {
          setShowAdd(false);
          LuigiClient.uxManager().removeBackdrop();
        }}
      />
    </ResourceDetails>
  );
}
export default NamespaceDetails;
