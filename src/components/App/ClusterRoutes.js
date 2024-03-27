import { useEffect } from 'react';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';

import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { clusterState } from 'state/clusterAtom';
import { clustersState } from 'state/clustersAtom';
import { languageAtom } from 'state/preferences/languageAtom';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { authDataState } from 'state/authDataAtom';
import { otherRoutes } from 'resources/other';
import { resourceRoutes } from 'resources';

import NamespaceRoutes from './NamespaceRoutes';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { IncorrectPath } from './IncorrectPath';

export default function ClusterRoutes() {
  let { currentClusterName } = useParams() || {};

  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useRecoilValue(languageAtom);
  const setAuth = useSetRecoilState(authDataState);
  const clusters = useRecoilValue(clustersState);
  const extensions = useRecoilValue(extensionsState);
  const [cluster, setCluster] = useRecoilState(clusterState);
  const [search] = useSearchParams();

  useEffect(() => {
    if (cluster?.name === currentClusterName) return;
    const currentCluster = clusters?.[currentClusterName];
    const kubeconfigId = search.get('kubeconfigID');
    if (!currentCluster && !kubeconfigId) {
      alert("Such cluster doesn't exist");
      navigate('/clusters');
      return;
    }
    setAuth(null);
    setCluster(currentCluster);
  }, [
    currentClusterName,
    cluster,
    clusters,
    navigate,
    setCluster,
    setAuth,
    search,
  ]);

  return (
    <Routes>
      <Route
        path="*"
        element={
          <IncorrectPath
            to="overview"
            message={t('components.incorrect-path.message.cluster')}
          />
        }
      />
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
      {extensions?.map(extension =>
        createExtensibilityRoutes(extension, language),
      )}
      {resourceRoutes}
      {otherRoutes}
      <Route path="namespaces/:namespaceId/*" element={<NamespaceRoutes />} />
    </Routes>
  );
}
