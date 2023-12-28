import React from 'react';
import { Button } from '@ui5/webcomponents-react';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import { ClusterValidation } from './ClusterValidation/ClusterValidation';
import { useFeature } from 'hooks/useFeature';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import ClusterStats from './ClusterStats';
import ClusterDetails from './ClusterDetails';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useTranslation } from 'react-i18next';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  const { t } = useTranslation();
  const clusterValidation = useFeature('CLUSTER_VALIDATION');
  const { nodes: data, error, loading } = useNodesQuery();

  const actions = (
    <Button design="Transparent" onClick={() => {}}>
      {t('common.buttons.delete')}
    </Button>
  );

  return (
    <>
      <DynamicPageComponent
        title={t('clusters.overview.title-current-cluster')}
        actions={actions}
        content={
          <>
            <Injections
              destination="ClusterOverview"
              slot="details-top"
              root=""
            />
            <ClusterDetails />
            {data && <ClusterStats data={data} />}
            <ClusterNodes data={data} error={error} loading={loading} />
            {clusterValidation?.isEnabled && <ClusterValidation />}
            <Injections destination="ClusterOverview" slot="details-bottom" />
          </>
        }
      />
      <YamlUploadDialog />
    </>
  );
}
