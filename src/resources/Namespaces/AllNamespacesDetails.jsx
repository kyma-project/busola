import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import { Title, ToolbarButton } from '@ui5/webcomponents-react';
import LimitRangeList from 'resources/LimitRanges/LimitRangeList';
import { EventsList } from 'shared/components/EventsList';
import { ResourceQuotasList as ResourceQuotaListComponent } from 'resources/ResourceQuotas/ResourceQuotasList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { createPortal } from 'react-dom';
import YamlUploadDialog from './YamlUpload/YamlUploadDialog';
import { showYamlUploadDialogAtom } from 'state/showYamlUploadDialogAtom';
import { useSetAtom } from 'jotai';
import './AllNamespaceDetails.scss';

export function AllNamespacesDetails() {
  const { t } = useTranslation();
  const setShowAdd = useSetAtom(showYamlUploadDialogAtom);

  const limitRangesParams = {
    hasDetailsView: true,
    resourceUrl: `/api/v1/limitranges`,
    resourceType: 'LimitRanges',
    namespace: '-all-',
    isCompact: true,
    showTitle: true,
  };

  const LimitrangesList = <LimitRangeList {...limitRangesParams} />;

  const resourceQuotasParams = {
    hasDetailsView: true,
    resourceUrl: `/api/v1/resourcequotas`,
    resourceType: 'ResourceQuotas',
    namespace: '-all-',
    isCompact: true,
    showTitle: true,
    disableCreate: true,
  };

  const ResourceQuotasList = (
    <ResourceQuotaListComponent {...resourceQuotasParams} />
  );

  const Events = <EventsList defaultType={EVENT_MESSAGE_TYPE.WARNING} />;

  const headerActions = (
    <>
      <ToolbarButton
        icon="add"
        onClick={() => {
          setShowAdd(true);
        }}
        text={t('upload-yaml.title')}
      />
      {createPortal(<YamlUploadDialog />, document.body)}
    </>
  );

  return (
    <DynamicPageComponent
      title={t('navigation.all-namespaces')}
      content={
        <section
          aria-labelledby="monitoring-heading"
          className="monitoring-section"
        >
          <Title
            level="H3"
            size="H3"
            className="sap-margin-y-small"
            id="monitoring-heading"
          >
            {t('common.headers.monitoring-and-health')}
          </Title>
          <div className="cluster-stats">
            <ResourcesUsage />
            <NamespaceWorkloads />
          </div>
          {LimitrangesList}
          {ResourceQuotasList}
          {Events}
        </section>
      }
      actions={headerActions}
    />
  );
}
