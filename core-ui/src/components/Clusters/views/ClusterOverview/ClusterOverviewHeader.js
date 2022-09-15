import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { getErrorMessage } from 'shared/utils/helpers';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Button } from 'fundamental-react';
import { ClusterStorageType } from '../ClusterStorageType';
import { useKymaVersionQuery } from './useKymaVersionQuery';
import { YamlUploadDialog } from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

const ClusterProvider = () => {
  const { t } = useTranslation();
  const gardenerShootCMUrl =
    '/api/v1/namespaces/kube-system/configmaps/shoot-info';
  const { data, error } = useGet(gardenerShootCMUrl);

  if (error) return null;

  return (
    <PageHeader.Column title={t('gardener.headers.provider')}>
      <p className="gardener-provider ">{data?.data.provider}</p>
    </PageHeader.Column>
  );
};

export function ClusterOverviewHeader() {
  const { t } = useTranslation();
  const { cluster, config } = useMicrofrontendContext();
  const [showAdd, setShowAdd] = useState(false);
  const {
    data: version,
    error: versionError,
    loading: versionLoading,
  } = useGet('/version');
  const { features } = useMicrofrontendContext();
  const showKymaVersion = features.SHOW_KYMA_VERSION?.isEnabled;
  const showGardenerMetadata = features.SHOW_GARDENER_METADATA?.isEnabled;

  const kymaVersion = useKymaVersionQuery({ skip: !showKymaVersion });

  function formatClusterVersion() {
    if (versionLoading) return t('common.headers.loading');
    if (versionError) return getErrorMessage(versionError);
    return version.gitVersion;
  }

  const actions = (
    <Button
      glyph="add"
      onClick={() => {
        setShowAdd(true);
        LuigiClient.uxManager().addBackdrop();
      }}
    >
      {t('upload-yaml.title')}
    </Button>
  );

  return (
    <>
      <PageHeader
        title={t('clusters.overview.title-current-cluster')}
        actions={actions}
      >
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
        {showGardenerMetadata && <ClusterProvider />}
      </PageHeader>
      <YamlUploadDialog
        show={showAdd}
        onCancel={() => {
          setShowAdd(false);
          LuigiClient.uxManager().removeBackdrop();
        }}
      />
    </>
  );
}
