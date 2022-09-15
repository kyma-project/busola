import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Button } from 'fundamental-react';
import { ClusterStorageType } from '../ClusterStorageType';
import { YamlUploadDialog } from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { useGetVersions } from './useGetVersions';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useGetGardenerProvider } from './useGetGardenerProvider';

const Versions = () => {
  const { t } = useTranslation();
  const { loading, kymaVersion, k8sVersion } = useGetVersions();

  return (
    <PageHeader.Column title={t('clusters.overview.version')}>
      {loading || (
        <>
          <p>
            {t('common.labels.kubernetes')}: {k8sVersion}
          </p>
          {kymaVersion && (
            <p>
              {t('common.labels.kyma')}: {kymaVersion}
            </p>
          )}
        </>
      )}
    </PageHeader.Column>
  );
};

const GardenerProvider = () => {
  const { t } = useTranslation();
  const { features } = useMicrofrontendContext();

  const showGardenerMetadata = features.SHOW_GARDENER_METADATA?.isEnabled;

  const provider = useGetGardenerProvider({
    skip: !showGardenerMetadata,
  });

  if (!showGardenerMetadata) return null;
  if (!provider) return null;

  return (
    <PageHeader.Column title={t('gardener.headers.provider')}>
      <p className="gardener-provider ">{provider}</p>
    </PageHeader.Column>
  );
};

export function ClusterOverviewHeader() {
  const { t } = useTranslation();
  const { cluster, config } = useMicrofrontendContext();
  const [showAdd, setShowAdd] = useState(false);

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
        <Versions />
        <PageHeader.Column title={t('clusters.common.api-server-address')}>
          {cluster?.cluster.server}
        </PageHeader.Column>
        <PageHeader.Column title={t('clusters.storage.title')}>
          <ClusterStorageType clusterConfig={config} />
        </PageHeader.Column>
        <GardenerProvider />
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
