import React, { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  WithTitle,
  useMicrofrontendContext,
  MainFrameRedirection,
} from 'react-shared';
// import { ContainersLogs } from 'components/Predefined/Details/Pod/ContainersLogs';
// import { CustomResource } from 'components/Predefined/Details/CustomResourceDefinitions/CustomResources.details';
// import { ClusterList } from 'components/Clusters/views/ClusterList';
// import { NoPermissions } from 'components/NoPermissions/NoPermissions';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
// import { NodeDetails } from 'components/Nodes/NodeDetails/NodeDetails';
import { useSentry } from '../../hooks/useSentry';
// import { HelmReleasesList } from 'components/HelmReleases/HelmReleasesList';
// import { HelmReleasesDetails } from 'components/HelmReleases/HelmReleasesDetails';

import resources from '../../routing/resources';

export default function App() {
  const { cluster, language } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();

  const serviceCatalogRoutes = useMemo(() => {
    return [
      '/catalog',
      '/catalog/ServiceClass/:serviceId',
      '/catalog/ServiceClass/:serviceId/plans',
      '/catalog/ServiceClass/:serviceId/plan/:planId',
      '/catalog/ClusterServiceClass/:serviceId',
      '/catalog/ClusterServiceClass/:serviceId/plans',
      '/catalog/ClusterServiceClass/:serviceId/plan/:planId',
      '/instances',
      '/instances/details/:instanceName',
    ].map(route => <Route key="route" path={route} element={null} />);
  }, []);

  return (
    // force rerender on cluster change
    <Routes key={cluster?.name}>
      {serviceCatalogRoutes}

      {/*<Route*/}
      {/*  path="/no-permissions"*/}
      {/*  element={*/}
      {/*    <WithTitle title={t('no-permissions.title')}>*/}
      {/*      <NoPermissions />*/}
      {/*    </WithTitle>*/}
      {/*  }*/}
      {/*/>*/}
      {/* /overview route should stay static  */}
      <Route
        path="/overview"
        element={
          <WithTitle title={t('clusters.overview.title-current-cluster')}>
            <ClusterOverview />
          </WithTitle>
        }
      />

      {/*<Route path="/overview/nodes/:nodeName" element={<RoutedNodeDetails />} />*/}

      {/*<Route*/}
      {/*  path="/clusters"*/}
      {/*  element={*/}
      {/*    <WithTitle title={t('clusters.overview.title-all-clusters')}>*/}
      {/*      <ClusterList />*/}
      {/*    </WithTitle>*/}
      {/*  }*/}
      {/*/>*/}
      {/*<Route path="/preferences" element={<Preferences />} />*/}

      {/*<Route*/}
      {/*  path="/applications/:name/:serviceName"*/}
      {/*  element={<RoutedApplicationServiceDetails />}*/}
      {/*/>*/}

      {/*<Route*/}
      {/*  path="/namespaces/:namespaceId/pods/:podName/containers/:containerName"*/}
      {/*  element={<RoutedContainerDetails />}*/}
      {/*/>*/}

      {/*<Route*/}
      {/*  path="/namespaces/:namespaceId/helm-releases"*/}
      {/*  element={*/}
      {/*    <WithTitle title={t('helm-releases.title')}>*/}
      {/*      <HelmReleasesList />*/}
      {/*    </WithTitle>*/}
      {/*  }*/}
      {/*/>*/}

      {/*<Route*/}
      {/*  path="/namespaces/:namespaceId/helm-releases/:releaseName"*/}
      {/*  element={*/}
      {/*    <WithTitle title={t('helm-releases.title')}>*/}
      {/*      <RoutedHelmReleaseDetails />*/}
      {/*    </WithTitle>*/}
      {/*  }*/}
      {/*/>*/}

      {/*<Route*/}
      {/*  path="/customresourcedefinitions/:customResourceDefinitionName/:resourceVersion/:resourceName"*/}
      {/*  element={<RoutedCustomResourceDetails />}*/}
      {/*/>*/}
      {/* handles namespace and cluster resources */}
      {resources}

      <Route path="" element={<MainFrameRedirection />} />
    </Routes>
  );
}
//
// function RoutedApplicationServiceDetails() {
//   const params = useParams();
//   const applicationName = decodeURIComponent(params.name);
//   const serviceName = decodeURIComponent(params.serviceName);
//   return (
//     <>
//       <ApplicationServiceDetails
//         applicationName={applicationName}
//         serviceName={serviceName}
//       />
//     </>
//   );
// }
//
// function RoutedNodeDetails() {
//   const { nodeName } = useParams();
//   return <NodeDetails nodeName={nodeName} />;
// }

// function RoutedHelmReleaseDetails() {
//   const { releaseName } = useParams();
//   return <HelmReleasesDetails releaseName={releaseName} />;
// }
//
// function RoutedContainerDetails() {
//   const params = useParams();
//   const decodedPodName = decodeURIComponent(params.podName);
//   const decodedContainerName = decodeURIComponent(params.containerName);
//   console.log('asdfasdfasdf');
//   return (
//     <ContainersLogs
//       params={{
//         podName: decodedPodName,
//         containerName: decodedContainerName,
//         namespace: params.namespaceId,
//       }}
//     />
//   );
// }
//
// function RoutedCustomResourceDetails() {
//   const routerParams = useParams();
//   const customResourceDefinitionName = decodeURIComponent(
//     routerParams.customResourceDefinitionName,
//   );
//   const resourceVersion = decodeURIComponent(routerParams.resourceVersion);
//   const resourceName = decodeURIComponent(routerParams.resourceName);
//
//   const params = {
//     customResourceDefinitionName,
//     resourceVersion,
//     resourceName,
//   };
//   console.log(123232323327);
//   return <CustomResource params={params} />;
// }
