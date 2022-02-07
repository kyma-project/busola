import React, { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Preferences from 'components/Preferences/Preferences';
import { useMicrofrontendContext, MainFrameRedirection } from 'react-shared';
import { ApplicationServiceDetails } from 'components/Predefined/Details/Application/ApplicationServicesDetails/ApplicationServicesDetails';
import { ContainersLogs } from 'components/Predefined/Details/Pod/ContainersLogs';
import { CustomResource } from 'components/Predefined/Details/CustomResourceDefinitions/CustomResources.details';
import { ComponentForList, ComponentForDetails } from 'shared/getComponents';
import { getResourceUrl } from 'shared/helpers';
import { ClusterList } from 'components/Clusters/views/ClusterList';
import { NoPermissions } from 'components/NoPermissions/NoPermissions';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { NodeDetails } from 'components/Nodes/NodeDetails/NodeDetails';
import { useSentry } from '../../hooks/useSentry';
import { HelmReleasesList } from 'components/HelmReleases/HelmReleasesList';
import { HelmReleasesDetails } from 'components/HelmReleases/HelmReleasesDetails';

export default function App() {
  const { cluster, language } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();

  return (
    // force rerender on cluster change
    <Routes key={cluster?.name}>
      <Route path="/no-permissions" exact element={<NoPermissions />} />
      <Route path="/overview" exact element={<ClusterOverview />} />
      <Route path="/overview/nodes/:nodeName" element={<RoutedNodeDetails />} />
      <Route path="/clusters" exact element={<ClusterList />} />
      <Route path="/preferences" element={<Preferences />} />

      <Route
        exact
        path="/applications/:name/:serviceName"
        element={<RoutedApplicationServiceDetails />}
      />

      <Route
        exact
        path="/namespaces/:namespaceId/pods/:podName/containers/:containerName"
        element={<RoutedContainerDetails />}
      />

      <Route
        exact
        path="/namespaces/:namespaceId/helm-releases"
        element={<HelmReleasesList />}
      />

      <Route
        exact
        path="/namespaces/:namespaceId/helm-releases/:releaseName"
        element={<RoutedHelmReleaseDetails />}
      />

      <Route
        exact
        path="/customresourcedefinitions/:customResourceDefinitionName/:resourceVersion/:resourceName"
        element={<RoutedCustomResourceDetails />}
      />

      <Route
        exact
        path="/namespaces/:namespaceId/:resourceType/:resourceName"
        element={<RoutedResourceDetails />}
      />
      <Route
        exact
        path="/namespaces/:namespaceId/:resourceType"
        element={<RoutedResourcesList />}
      />
      <Route
        exact
        path="/:resourceType/:resourceName"
        element={<RoutedResourceDetails />}
      />

      <Route exact path="/:resourceType" element={<RoutedResourcesList />} />
      <Route exact path="" element={<MainFrameRedirection />} />
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

function RoutedCustomResourceDetails() {
  const routerParams = useParams();
  const customResourceDefinitionName = decodeURIComponent(
    routerParams.customResourceDefinitionName,
  );
  const resourceVersion = decodeURIComponent(routerParams.resourceVersion);
  const resourceName = decodeURIComponent(routerParams.resourceName);

  const params = {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
  };

  return <CustomResource params={params} />;
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
