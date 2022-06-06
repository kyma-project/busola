import React, { useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useSentry } from 'hooks/useSentry';

import { resourceRoutes } from 'resources';
import otherRoutes from 'resources/other';

function Clusters() {
  return 'tu bd lista klastrów';
}

function EmptyPathRedirect({ currentCluster }) {
  const path = currentCluster ? `/cluster/${currentCluster}` : '/clusters';
  return <Navigate to={path} replace />;
}

export default function App() {
  const [currentCluster] = useState('a');
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
    <Routes>
      <Route path="clusters" element={<Clusters />} />
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
      <Route
        path="*"
        element={<EmptyPathRedirect currentCluster={currentCluster} />}
      />
    </Routes>
  );
}

// export function App2() {
//   const { cluster, language } = useMicrofrontendContext();
//   const { t, i18n } = useTranslation();

//   useEffect(() => {
//     i18n.changeLanguage(language);
//   }, [language, i18n]);

//   useSentry();

//   const serviceCatalogRoutes = useMemo(() => {
//     return [
//       '/catalog',
//       '/catalog/ServiceClass/:serviceId',
//       '/catalog/ServiceClass/:serviceId/plans',
//       '/catalog/ServiceClass/:serviceId/plan/:planId',
//       '/catalog/ClusterServiceClass/:serviceId',
//       '/catalog/ClusterServiceClass/:serviceId/plans',
//       '/catalog/ClusterServiceClass/:serviceId/plan/:planId',
//       '/instances',
//       '/instances/details/:instanceName',
//     ].map(route => <Route key="route" path={route} element={null} />);
//   }, []);

//   function Clusters() {
//     return 'clusters';
//   }

//   return (
//     // force rerender on cluster change
//     <Routes key={cluster?.name}>
//       {/* <Route path="clusters" element={<Clusters />} /> */}
//       {serviceCatalogRoutes}
//       <Route
//         path="/overview" // overview route should stay static
//         element={
//           <WithTitle title={t('clusters.overview.title-current-cluster')}>
//             <ClusterOverview />
//           </WithTitle>
//         }
//       />
//       {namespacedResourceRoutes}
//       {otherRoutes}
//     </Routes>
//   );
// }
