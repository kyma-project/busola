import { useTranslation } from 'react-i18next';
import { ToolbarButton } from '@ui5/webcomponents-react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { LimitRangesList } from 'resources/LimitRanges/LimitRangesList';
import { ResourceQuotasList as ResourceQuotaListComponent } from 'resources/ResourceQuotas/ResourceQuotasList';
import { showYamlUploadDialogAtom } from 'state/showYamlUploadDialogAtom';

import { NamespaceStatus } from './NamespaceStatus';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import NamespaceCreate from './NamespaceCreate';
import { AllNamespacesDetails } from './AllNamespacesDetails';

import { ResourceDescription } from 'resources/Namespaces';
import { useSetAtom } from 'jotai';

export default function NamespaceDetails(props) {
  const { t } = useTranslation();
  const setShowAdd = useSetAtom(showYamlUploadDialogAtom);

  if (props.resourceName === '-all-') {
    return <AllNamespacesDetails {...props} />;
  }

  const limitRangesParams = {
    hasDetailsView: true,
    resourceUrl: `/api/v1/namespaces/${props.resourceName}/limitranges`,
    resourceType: 'LimitRanges',
    namespace: props.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const LimitrangesList = <LimitRangesList {...limitRangesParams} />;

  const resourceQuotasParams = {
    hasDetailsView: true,
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
    <ToolbarButton
      icon="add"
      onClick={() => {
        setShowAdd(true);
      }}
      text={t('upload-yaml.title')}
    ></ToolbarButton>
  );

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: (namespace) => (
        <NamespaceStatus namespaceStatus={namespace.status} />
      ),
    },
  ];

  return (
    <ResourceDetails
      createResourceForm={NamespaceCreate}
      description={ResourceDescription}
      {...props}
      title={t('namespaces.namespace-details')}
      windowTitle={t('namespaces.overview.title')}
      customColumns={customColumns}
      headerActions={headerActions}
      customHealthCards={[
        () => (
          <ResourcesUsage namespace={props.resourceName} key="resourcesUsage" />
        ),
        () => (
          <NamespaceWorkloads
            namespace={props.resourceName}
            key="namespaceWorkloads"
          />
        ),
      ]}
      showHealthCardsTitle={true}
    >
      {LimitrangesList}
      {ResourceQuotasList}
      {Events}
    </ResourceDetails>
  );
}
