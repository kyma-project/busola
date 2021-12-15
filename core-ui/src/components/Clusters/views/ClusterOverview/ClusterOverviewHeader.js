import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGet,
  useMicrofrontendContext,
  PageHeader,
  getErrorMessage,
} from 'react-shared';
import { ClusterStorageType } from '../ClusterStorageType';
import { useKymaVersionQuery } from './useKymaVersionQuery';

export function ClusterOverviewHeader() {
  const { t } = useTranslation();
  const { cluster, config } = useMicrofrontendContext();
  const {
    data: version,
    error: versionError,
    loading: versionLoading,
  } = useGet('/version');
  const { features } = useMicrofrontendContext();
  const showKymaVersion = features.SHOW_KYMA_VERSION?.isEnabled;

  const kymaVersion = useKymaVersionQuery({ skip: !showKymaVersion });

  function formatClusterVersion() {
    if (versionLoading) return t('common.headers.loading');
    if (versionError) return getErrorMessage(versionError);
    return version.gitVersion;
  }

  return (
    <PageHeader title={t('clusters.overview.title-current-cluster')}>
      <PageHeader.Column title={t('clusters.overview.version')}>
        {showKymaVersion ? (
          <>
            <p>
              {t('common.labels.kubernetes')}: {formatClusterVersion()}
            </p>
            <p>
              {t('common.labels.kyma')}: {kymaVersion}
            </p>
          </>
        ) : (
          formatClusterVersion()
        )}
      </PageHeader.Column>
      <PageHeader.Column title={t('clusters.common.api-server-address')}>
        {cluster?.cluster.server}
      </PageHeader.Column>
      <PageHeader.Column title={t('clusters.storage.title')}>
        <ClusterStorageType clusterConfig={config} />
      </PageHeader.Column>
    </PageHeader>
  );
}
