import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { LimitRangeList } from 'resources/LimitRanges/LimitRangeList';
import { ResourceQuotaList as ResourceQuotaListComponent } from 'resources/ResourceQuotas/ResourceQuotaList';
import { YamlUploadDialog } from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

import { NamespaceStatus } from './NamespaceStatus';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import { NamespaceCreate } from './NamespaceCreate';
import { AllNamespacesDetails } from './AllNamespacesDetails';

import './NamespaceDetails.scss';

export function NamespaceDetails(props) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);

  if (props.resourceName === '-all-') {
    return <AllNamespacesDetails {...props} />;
  }

  const limitRangesParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${props.resourceName}/limitranges`,
    resourceType: 'LimitRanges',
    namespace: props.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const LimitrangesList = <LimitRangeList {...limitRangesParams} />;

  const resourceQuotasParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${props.resourceName}/resourcequotas`,
    resourceType: 'ResourceQuotas',
    namespace: props.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const ResourceQuotasList = (
    <ResourceQuotaListComponent {...resourceQuotasParams} />
  );

  const Events = (
    <EventsList
      namespace={props.resourceName}
      defaultType={EVENT_MESSAGE_TYPE.WARNING}
    />
  );

  const headerActions = (
    <>
      <Button
        className="fd-margin-end--tiny"
        glyph="add"
        onClick={() => {
          setShowAdd(true);
        }}
        iconBeforeText
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
      {Events}
      <YamlUploadDialog
        show={showAdd}
        onCancel={() => {
          setShowAdd(false);
        }}
      />
    </ResourceDetails>
  );
}
export default NamespaceDetails;
