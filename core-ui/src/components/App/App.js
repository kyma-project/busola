import React, { useEffect, useMemo } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Preferences from 'components/Preferences/Preferences';
import {
  WithTitle,
  useMicrofrontendContext,
  MainFrameRedirection,
} from 'react-shared';
import { ApplicationServiceDetails } from 'components/Predefined/Details/Application/ApplicationServicesDetails/ApplicationServicesDetails';
import { ContainersLogs } from 'components/Predefined/Details/Pod/ContainersLogs';
import { ComponentForList, ComponentForDetails } from 'shared/getComponents';
import { getResourceUrl } from 'shared/helpers';
import { ClusterList } from 'components/Clusters/views/ClusterList';
import { NoPermissions } from 'components/NoPermissions/NoPermissions';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { NodeDetails } from 'components/Nodes/NodeDetails/NodeDetails';
import { useSentry } from '../../hooks/useSentry';
import { HelmReleasesList } from 'components/HelmReleases/HelmReleasesList';
import { HelmReleasesDetails } from 'components/HelmReleases/HelmReleasesDetails';
import { getPerResourceDefs } from 'shared/helpers/getResourceDefs';
import { CRDGroupList, CustomResourceGroupList } from './CRDGroupList';
import { CustomResourcesGroup } from './CustomResourcesGroup';
import { CustomResource } from './../Predefined/Details/CustomResourceDefinitions/CustomResources.details';

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
      <Route
        path="/no-permissions"
        element={
          <WithTitle title={t('no-permissions.title')}>
            <NoPermissions />
          </WithTitle>
        }
      />
      <Route
        path="/overview"
        element={
          <WithTitle title={t('clusters.overview.title-current-cluster')}>
            <ClusterOverview />
          </WithTitle>
        }
      />
      <Route path="/overview/nodes/:nodeName" element={<RoutedNodeDetails />} />
      <Route
        path="/clusters"
        element={
          <WithTitle title={t('clusters.overview.title-all-clusters')}>
            <ClusterList />
          </WithTitle>
        }
      />
      <Route path="/preferences" element={<Preferences />} />
      <Route
        path="/applications/:name/:serviceName"
        element={<RoutedApplicationServiceDetails />}
      />
      <Route
        path="/namespaces/:namespaceId/pods/:podName/containers/:containerName"
        element={<RoutedContainerDetails />}
      />
      <Route
        path="/namespaces/:namespaceId/helm-releases"
        element={
          <WithTitle title={t('helm-releases.title')}>
            <HelmReleasesList />
          </WithTitle>
        }
      />
      <Route
        path="/namespaces/:namespaceId/helm-releases/:releaseName"
        element={
          <WithTitle title={t('helm-releases.title')}>
            <RoutedHelmReleaseDetails />
          </WithTitle>
        }
      />
      <Route
        path="/customresources"
        element={
          <WithTitle title={t('custom-resources.title')}>
            <CustomResourceGroupList />
          </WithTitle>
        }
      />
      <Route
        path="/customresourcedefinitions"
        element={
          <WithTitle title={t('custom-resource-definitions.title')}>
            <CRDGroupList />
          </WithTitle>
        }
      />
      <Route path="/customresources/:crdName" element={<RoutedCRDList />} />
      <Route
        path="/customresources/:crdName/:crName"
        element={<RoutedCRDDetails />}
      />
      <Route
        path="/namespaces/:namespaceId/customresources/"
        element={<RoutedNamespacedCRDGroupList />}
      />
      <Route
        path="/namespaces/:namespaceId/customresources/:crdName"
        element={<RoutedCRDList />}
      />
      <Route
        path="/namespaces/:namespaceId/:resourceType/:resourceName"
        element={<RoutedResourceDetails />}
      />
      <Route
        path="/namespaces/:namespaceId/:resourceType"
        element={<RoutedResourcesList />}
      />
      <Route
        path="/:resourceType/:resourceName"
        element={<RoutedResourceDetails />}
      />
      <Route path="/:resourceType" element={<RoutedResourcesList />} />
      <Route path="" element={<MainFrameRedirection />} />
    </Routes>
  );
}

function RoutedApplicationServiceDetails() {
  const params = useParams();
  const applicationName = decodeURIComponent(params.name);
  const serviceName = decodeURIComponent(params.serviceName);

  return (
    <ApplicationServiceDetails
      applicationName={applicationName}
      serviceName={serviceName}
    />
  );
}

function RoutedNodeDetails() {
  const { nodeName } = useParams();
  return <NodeDetails nodeName={nodeName} />;
}

function RoutedHelmReleaseDetails() {
  const { releaseName } = useParams();
  return <HelmReleasesDetails releaseName={releaseName} />;
}

function RoutedContainerDetails() {
  const params = useParams();
  const decodedPodName = decodeURIComponent(params.podName);
  const decodedContainerName = decodeURIComponent(params.containerName);

  return (
    <ContainersLogs
      params={{
        podName: decodedPodName,
        containerName: decodedContainerName,
        namespace: params.namespaceId,
      }}
    />
  );
}

function RoutedNamespacedCRDGroupList() {
  const { t } = useTranslation();
  const { namespaceId } = useParams();

  return (
    <WithTitle title={t('custom-resources.title')}>
      <CustomResourceGroupList namespace={namespaceId} />
    </WithTitle>
  );
}

// function RoutedNamespacedCRDList() {
//   const { t } = useTranslation();
//   const { namespaceId, crdName } = useParams();

//   return (
//     <WithTitle title={t('custom-resources.title')}>
//       <CustomResourcesGroup namespace={namespaceId} crdName={crdName} />
//     </WithTitle>
//   );
// }

function RoutedCRDList() {
  const { crdName, namespaceId } = useParams();

  return <CustomResourcesGroup crdName={crdName} namespace={namespaceId} />;
}

function RoutedCRDDetails() {
  const { crdName, crName } = useParams();

  return (
    <CustomResource
      params={{
        customResourceDefinitionName: crdName,
        resourceName: crName,
      }}
    />
  );
}

function RoutedResourcesList() {
  const routerParams = useParams();
  const queryParams = new URLSearchParams(window.location.search);

  const resourceUrl = getResourceUrl();

  const params = {
    hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: routerParams.resourceType,
    namespace: routerParams.namespaceId,
  };

  const rendererName = params.resourceType + 'List';
  const rendererNameForCreate = params.resourceType + 'Create';

  return (
    <ComponentForList
      name={rendererName}
      params={params}
      nameForCreate={rendererNameForCreate}
    />
  );
}

function RoutedResourceDetails() {
  const { t } = useTranslation();
  const context = useMicrofrontendContext();
  const { resourceName, resourceType, namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);

  const resourceUrl = getResourceUrl();

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(resourceName);

  const params = {
    resourceUrl: decodedResourceUrl,
    resourceType: resourceType,
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceGraphConfig: getPerResourceDefs('resourceGraphConfig', t, context),
  };

  const rendererName = params.resourceType + 'Details';
  const rendererNameForCreate = params.resourceType + 'Create';

  return (
    <ComponentForDetails
      name={rendererName}
      nameForCreate={rendererNameForCreate}
      params={params}
    />
  );
}
