import React, { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Navigation } from '../Navigation/Navigation';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';

import { resourceRoutes } from 'resources';
import otherRoutes from 'resources/other';
import ClusterList from 'components/Clusters/views/ClusterList';
import { useAuth } from 'store/clusters/useAuth';
import { useSelector } from 'react-redux';
import { selectCurrentCluster } from 'store/clusters/clusters.slice';
import jwtDecode from 'jwt-decode';

export default function App() {
  const auth = useAuth();
  if (auth?.token) {
    console.log('expires', auth && jwtDecode(auth.token).exp);
  }
  const { t } = useTranslation();

  const Null = () => 'null';

  const serviceCatalogRoutes = useMemo(() => {
    return [
      'namespaces/:namespaceId/catalog',
      'catalog/ServiceClass/:serviceId',
      'catalog/ServiceClass/:serviceId/plans',
      'catalog/ServiceClass/:serviceId/plan/:planId',
      'catalog/ClusterServiceClass/:serviceId',
      'catalog/ClusterServiceClass/:serviceId/plans',
      'catalog/ClusterServiceClass/:serviceId/plan/:planId',
      'instances',
      'instances/details/:instanceName',
    ].map(route => <Route key="route" path={route} element={<Null />} />);
  }, []);

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="clusters" element={<ClusterList />} />
        <Route path="cluster/:currentClusterName/*">
          <Route
            path="overview" // overview route should stay static
            element={
              <WithTitle title={t('clusters.overview.title-current-cluster')}>
                <ClusterOverview />
              </WithTitle>
            }
          />
          {serviceCatalogRoutes}
          {resourceRoutes}
          {otherRoutes}
          {/* todo redirect to ns details on invalid path */}
          {/* <Route path="*" element={<Navigate to="overview" replace />} /> */}
        </Route>
        {/* <Route
          path="*"
          element={<EmptyPathRedirect />}
        /> */}
      </Routes>
    </>
  );
}
