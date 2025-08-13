import { useEffect, useState } from 'react';
import {
  Route,
  Routes,
  useSearchParams,
  useNavigate,
  useParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { useAtomValue } from 'jotai';

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
import { removePreviousPath } from 'state/useAfterInitHook';
import { useUrl } from 'hooks/useUrl';

export default function ClusterRoutes() {
  let { currentClusterName } = useParams() || {};

  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useRecoilValue(languageAtom);
  const setAuth = useSetRecoilState(authDataState);
  const clusters = useAtomValue(clustersState);
  const extensions = useRecoilValue(extensionsState);
  const [cluster, setCluster] = useRecoilState(clusterState);
  const [search] = useSearchParams();
  const [extensibilityRoutes, setExtensibilityRoutes] = useState(null);
  const { clusterUrl } = useUrl();

  useEffect(() => {
    if (extensions?.length) {
      setExtensibilityRoutes(
        extensions?.map(extension =>
          createExtensibilityRoutes(extension, language),
        ),
      );
    }
  }, [extensions, language]);

  useEffect(() => {
    if (cluster?.name === currentClusterName) return;
    const currentCluster = clusters?.[currentClusterName];
    const kubeconfigId = search.get('kubeconfigID');
    if (!currentCluster && !kubeconfigId) {
      removePreviousPath();
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
      {extensibilityRoutes && (
        <Route
          path="*"
          element={
            <IncorrectPath
              to={clusterUrl('overview')}
              message={t('components.incorrect-path.message.cluster')}
            />
          }
        />
      )}
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
      {extensibilityRoutes}
      {resourceRoutes}
      {otherRoutes}
      <Route path="namespaces/:namespaceId">
        <Route path="*" element={<NamespaceRoutes />} />
      </Route>
    </Routes>
  );
}
