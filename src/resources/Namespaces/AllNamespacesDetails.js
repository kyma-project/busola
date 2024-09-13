import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import { spacing } from '@ui5/webcomponents-react-base';
import { Title } from '@ui5/webcomponents-react';
import LimitRangeList from 'resources/LimitRanges/LimitRangeList';
import { EventsList } from 'shared/components/EventsList';
import { ResourceQuotasList as ResourceQuotaListComponent } from 'resources/ResourceQuotas/ResourceQuotasList';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { createPortal } from 'react-dom';
import YamlUploadDialog from './YamlUpload/YamlUploadDialog';

export function AllNamespacesDetails() {
  const { t } = useTranslation();

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

  return (
    <>
      <DynamicPageComponent
        title={t('navigation.all-namespaces')}
        content={
          <>
            <Title
              level="H3"
              style={{
                ...spacing.sapUiMediumMarginBegin,
                ...spacing.sapUiMediumMarginTopBottom,
              }}
            >
              {t('common.headers.monitoring-and-health')}
            </Title>
            <div className="cluster-stats" style={spacing.sapUiTinyMargin}>
              <ResourcesUsage />
              <NamespaceWorkloads />
            </div>
            {LimitrangesList}
            {ResourceQuotasList}
            {Events}
          </>
        }
        actions={createPortal(<YamlUploadDialog />, document.body)}
      />
    </>
  );
}
