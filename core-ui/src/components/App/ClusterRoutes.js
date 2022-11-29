import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useRecoilState } from 'recoil';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { clusterState } from 'state/clusterAtom';
import { clustersState } from 'state/clustersAtom';
import { languageAtom } from 'state/preferences/languageAtom';

import NamespaceRoutes from './NamespaceRoutes';
import { resourceRoutes } from 'resources';
import { createExtensibilityRoutes } from './ExtensibilityRoutes';
import otherRoutes from 'resources/other';

import './App.scss';

export default function ClusterRoutes() {
  let { currentClusterName } = useParams() || {};

  const navigate = useNavigate();
  const { customResources = [] } = useMicrofrontendContext();
  const { t } = useTranslation();
  const language = useRecoilValue(languageAtom);
  const clusters = useRecoilValue(clustersState);
  const [cluster, setCluster] = useRecoilState(clusterState);

  useEffect(() => {
    if (cluster?.name === currentClusterName) return;
    const currentCluster = clusters?.[currentClusterName];
    if (!currentCluster) {
      alert("Such cluster doesn't exist");
      navigate('/clusters');
      return;
    }
    setCluster(currentCluster);
  }, [currentClusterName]);

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

      <Route
        path="namespaces/:namespaceId"
        element={<Navigate to="namespaces/:namespaceId/details" />}
      />
      <Route path="namespaces/:namespaceId/*" element={<NamespaceRoutes />} />
      {/* extensibility routes should go first, so if someone overwrites the default view, the new one should have a higher priority */}
      {customResources?.map(cr => createExtensibilityRoutes(cr, language))}
      {resourceRoutes}
      {otherRoutes}
    </Routes>
  );
}
