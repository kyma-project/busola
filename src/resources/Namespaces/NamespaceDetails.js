import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EventsList } from 'shared/components/EventsList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { LimitRangeList } from 'resources/LimitRanges/LimitRangeList';
import { ResourceQuotaList as ResourceQuotaListComponent } from 'resources/ResourceQuotas/ResourceQuotaList';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';

import { NamespaceStatus } from './NamespaceStatus';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import { NamespaceCreate } from './NamespaceCreate';
import { AllNamespacesDetails } from './AllNamespacesDetails';

import './NamespaceDetails.scss';
import { useSetRecoilState } from 'recoil';
import { spacing } from '@ui5/webcomponents-react-base';

export function NamespaceDetails(props) {
  const { t } = useTranslation();
  const setShowAdd = useSetRecoilState(showYamlUploadDialogState);

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
        icon="add"
        onClick={() => {
          setShowAdd(true);
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
      title={t('namespaces.namespace-details')}
      windowTitle={t('namespaces.overview.title')}
      customColumns={customColumns}
      headerActions={headerActions}
    >
      <div className="panel-grid" style={spacing.sapUiSmallMargin}>
        <NamespaceWorkloads namespace={props.resourceName} />
        <ResourcesUsage namespace={props.resourceName} />
      </div>
      {LimitrangesList}
      {ResourceQuotasList}
      {Events}
    </ResourceDetails>
  );
}
export default NamespaceDetails;
