import { Button } from '@ui5/webcomponents-react';
import { useRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { YamlUploadDialog } from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
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
    <DynamicPageComponent.Column title={t('clusters.overview.version')}>
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
    </DynamicPageComponent.Column>
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
    <DynamicPageComponent.Column title={t('gardener.headers.provider')}>
      <p className="gardener-provider ">{provider}</p>
    </DynamicPageComponent.Column>
  );
};

export function ClusterOverviewHeader(content) {
  const { t } = useTranslation();
  const cluster = useRecoilValue(clusterState);
  const { currentCluster } = useClustersInfo();
  const config = currentCluster?.config;
  const [showAdd, setShowAdd] = useRecoilState(showYamlUploadDialogState);

  const actions = (
    <Button
      icon="add"
      onClick={() => {
        setShowAdd(true);
      }}
    >
      {t('upload-yaml.title')}
    </Button>
  );

  return (
    <>
      <DynamicPageComponent
        title={t('clusters.overview.title-current-cluster')}
        actions={actions}
        content={content?.content}
      >
        <Versions />
        <DynamicPageComponent.Column
          title={t('clusters.common.api-server-address')}
        >
          {cluster?.currentContext?.cluster?.cluster?.server}
        </DynamicPageComponent.Column>
        <DynamicPageComponent.Column title={t('clusters.storage.title')}>
          <ClusterStorageType clusterConfig={config} />
        </DynamicPageComponent.Column>
        <GardenerProvider />
      </DynamicPageComponent>
      <YamlUploadDialog
        open={showAdd}
        onCancel={() => {
          setShowAdd(false);
        }}
      />
    </>
  );
}
