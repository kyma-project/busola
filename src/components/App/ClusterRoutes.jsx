import { Suspense, useEffect, useMemo } from 'react';
import {
  Route,
  Routes,
  useSearchParams,
  useNavigate,
  useParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { unwrap } from 'jotai/utils';

import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { clusterAtom } from 'state/clusterAtom';
import { clustersAtom } from 'state/clustersAtom';
import { languageAtom } from 'state/settings/languageAtom';
import { extensionsAtom } from 'state/navigation/extensionsAtom';
import { authDataAtom } from 'state/authDataAtom';
import { otherRoutes } from 'resources/other';
import { resourceRoutes } from 'resources';

import NamespaceRoutes from './NamespaceRoutes';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import { IncorrectPath } from './IncorrectPath';
import { removePreviousPath } from 'state/useAfterInitHook';
import { useUrl } from 'hooks/useUrl';
import { sidebarNavigationNodesAtom } from 'state/navigation/sidebarNavigationNodesAtom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const sidebarNavigationNodesSync = unwrap(
  sidebarNavigationNodesAtom,
  (prev) => prev ?? null,
);

export default function ClusterRoutes() {
  const { currentClusterName } = useParams() || {};

  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useAtomValue(languageAtom);
  const setAuth = useSetAtom(authDataAtom);
  const auth = useAtomValue(authDataAtom);
  const clusters = useAtomValue(clustersAtom);
  const extensions = useAtomValue(extensionsAtom);
  const navigationNodes = useAtomValue(sidebarNavigationNodesSync);
  const [cluster, setCluster] = useAtom(clusterAtom);
  const [search] = useSearchParams();
  const { clusterUrl } = useUrl();

  const extensibilityRoutes = useMemo(() => {
    if (extensions?.length) {
      return extensions?.map((extension) =>
        createExtensibilityRoutes(extension, language),
      );
    }
    return null;
  }, [extensions, language]);

  useEffect(() => {
    // Some browsers (e.g., Firefox) have a problem with authentication redirects.
    // If the redirect doesn't occur, refreshing to reload helps.
    const timeoutId = setTimeout(() => {
      const pathname = `/cluster/${encodeURIComponent(
        currentClusterName,
      )}/overview`;
      if (
        cluster &&
        cluster?.name === currentClusterName &&
        navigationNodes !== null &&
        !navigationNodes?.length &&
        !auth &&
        window.location.href.includes(pathname)
      ) {
        navigate(0, { replace: true });
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [currentClusterName, cluster, navigate, navigationNodes, auth]);

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
    if (cluster?.name) {
      setAuth(null);
    }
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
          <Suspense fallback={<Spinner />}>
            <WithTitle title={t('clusters.overview.title-current-cluster')}>
              <ClusterOverview />
            </WithTitle>
          </Suspense>
        }
      />

      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {extensibilityRoutes}
      {resourceRoutes}
      {otherRoutes}
      <Route path="namespaces/:namespaceId">
        <Route
          path="*"
          element={
            <Suspense fallback={<Spinner />}>
              <NamespaceRoutes />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
