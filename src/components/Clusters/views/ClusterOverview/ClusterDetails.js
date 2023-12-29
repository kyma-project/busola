import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { Title } from '@ui5/webcomponents-react';
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
      <p style={{ textTransform: 'uppercase' }}>{provider}</p>
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
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          ...spacing.sapUiSmallMarginBegin,
        }}
      >
        <UI5Panel
          disableMargin
          title={t('cluster-overview.resource-details.metadata')}
        >
          <div
            style={{
              ...spacing.sapUiTinyMargin,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTempllateRows: 'repeat(3, 1fr)',
              gridGap: '25px',
            }}
          >
            <DynamicPageComponent.Column
              title={t('clusters.overview.resource-type') + ':'}
            >
              Cluster
            </DynamicPageComponent.Column>
            {!loading && (
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
        </UI5Panel>
      </div>
    </>
  );
}
