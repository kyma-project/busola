import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { ClusterStorageType } from '../ClusterStorageType';
import { useGetGardenerProvider } from './useGetGardenerProvider';
import { useGetVersions } from './useGetVersions';
import { useFeature } from 'hooks/useFeature';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';

const GardenerProvider = () => {
  const { t } = useTranslation();
  const showGardenerMetadata = useFeature('SHOW_GARDENER_METADATA')?.isEnabled;

  const provider = useGetGardenerProvider({
    skip: !showGardenerMetadata,
  });

  if (!showGardenerMetadata) return null;
  if (!provider) return null;

  return (
    <DynamicPageComponent.Column title={t('gardener.headers.provider') + ':'}>
      <p className="gardener-provider">{provider}</p>
    </DynamicPageComponent.Column>
  );
};

export default function ClusterDetails({ currentCluster }) {
  const { t } = useTranslation();
  const { loading, kymaVersion, k8sVersion } = useGetVersions();
  const config = currentCluster?.config;

  return (
    <>
      <Title
        level="H4"
        style={{
          ...spacing.sapUiMediumMarginBegin,
          ...spacing.sapUiMediumMarginTop,
          ...spacing.sapUiSmallMarginBottom,
        }}
      >
        {t('cluster-overview.resource-details.title')}
      </Title>
      <div
        className="cluster-overview__details-wrapper"
        style={spacing.sapUiSmallMarginBeginEnd}
      >
        <Card
          header={
            <CardHeader
              titleText={t('cluster-overview.resource-details.metadata')}
            />
          }
        >
          <div
            className="cluster-overview__details-grid"
            style={spacing.sapUiSmallMargin}
          >
            <DynamicPageComponent.Column
              title={t('clusters.overview.resource-type') + ':'}
            >
              {t('clusters.overview.cluster')}
            </DynamicPageComponent.Column>
            {!loading && k8sVersion && (
              <DynamicPageComponent.Column
                title={t('clusters.overview.kubernetes-version') + ':'}
              >
                {k8sVersion}
              </DynamicPageComponent.Column>
            )}
            <DynamicPageComponent.Column
              title={t('clusters.storage.title') + ':'}
            >
              <ClusterStorageType clusterConfig={config} />
            </DynamicPageComponent.Column>
            {!loading && kymaVersion && (
              <DynamicPageComponent.Column
                title={t('clusters.overview.kyma-version') + ':'}
              >
                {kymaVersion}
              </DynamicPageComponent.Column>
            )}
            <DynamicPageComponent.Column
              title={t('clusters.common.api-server-address') + ':'}
            >
              {currentCluster?.currentContext?.cluster?.cluster?.server}
            </DynamicPageComponent.Column>
            <GardenerProvider />
          </div>
        </Card>
      </div>
    </>
  );
}
