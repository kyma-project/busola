import { Button } from 'fundamental-react';
import { useRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { YamlUploadDialog } from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { ClusterStorageType } from '../ClusterStorageType';
import { useGetGardenerProvider } from './useGetGardenerProvider';
import { useGetVersions } from './useGetVersions';
import { useFeature } from 'hooks/useFeature';
import { clusterState } from 'state/clusterAtom';

import { useClustersInfo } from 'state/utils/getClustersInfo';

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
  const showGardenerMetadata = useFeature('SHOW_GARDENER_METADATA')?.isEnabled;

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
  const cluster = useRecoilValue(clusterState);
  const { currentCluster } = useClustersInfo();
  const config = currentCluster?.config;
  const [showAdd, setShowAdd] = useRecoilState(showYamlUploadDialogState);

  const actions = (
    <Button
      glyph="add"
      onClick={() => {
        setShowAdd(true);
      }}
      iconBeforeText
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
          {cluster?.currentContext?.cluster?.cluster?.server}
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
        }}
      />
    </>
  );
}
