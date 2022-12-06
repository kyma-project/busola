import { useEffect } from 'react';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';

import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { clusterState } from 'state/clusterAtom';
import { clustersState } from 'state/clustersAtom';
import { languageAtom } from 'state/preferences/languageAtom';

import NamespaceRoutes from './NamespaceRoutes';
import { otherRoutes } from 'resources/other';
import { resourceRoutes } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { extensionsState } from 'state/navigation/extensionsAtom';

export default function ClusterRoutes() {
  let { currentClusterName } = useParams() || {};

  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useRecoilValue(languageAtom);
  const clusters = useRecoilValue(clustersState);
  const extensions = useRecoilValue(extensionsState);
  const [cluster, setCluster] = useRecoilState(clusterState);
  const [search] = useSearchParams();

  useEffect(() => {
    if (cluster?.name === currentClusterName) return;
    const currentCluster = clusters?.[currentClusterName];
    const kubeconfigId = search.get('kubeconfigId');
    if (!currentCluster && !kubeconfigId) {
      alert("Such cluster doesn't exist");
      navigate('/clusters');
      return;
    }
    setCluster(currentCluster);
  }, [currentClusterName, cluster, clusters, navigate, setCluster, search]);

  return (
    <Routes>
      {/*  overview route should stay static  */}
      <Route
        path="overview"
        element={
          <WithTitle title={t('clusters.overview.title-current-cluster')}>
            <ClusterOverview />
          </WithTitle>
        }
      />

      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {extensions?.map(cr => createExtensibilityRoutes(cr, language))}
      {resourceRoutes}
      {otherRoutes}
      <Route path="namespaces/:namespaceId/*" element={<NamespaceRoutes />} />
    </Routes>
  );
}
