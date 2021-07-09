import React from 'react';
import { Route, Switch } from 'react-router-dom';

import {
  PREFERENCES_TITLE,
  API_RULES_TITLE,
  CLUSTERS_OVERVIEW_TITLE,
  ADD_CLUSTER_TITLE,
  NO_PERMISSIONS_TITLE,
  CLUSTER_OVERVIEW_TITLE,
} from 'shared/constants';
import { withTitle, useMicrofrontendContext } from 'react-shared';
import CreateApiRule from '../ApiRules/CreateApiRule/CreateApiRule';
import EditApiRule from 'components/ApiRules/EditApiRule/EditApiRule';
import { ComponentForList, ComponentForDetails } from 'shared/getComponents';
import { getResourceUrl } from 'shared/helpers';
import { ClusterList } from 'components/Clusters/views/ClusterList';

//React.lazy currently only supports default exports. If the module you want to import uses named exports, you can create an intermediate module that reexports it as the default.
const Preferences = React.lazy(() =>
  import('components/Preferences/Preferences'),
);

const ContainersLogs = React.lazy(() =>
  import('components/Predefined/Details/Pod/ContainersLogs'),
);

const CustomResource = React.lazy(() =>
  import(
    'components/Predefined/Details/CustomResourceDefinitions/CustomResources.details'
  ),
);

const NoPermissions = React.lazy(() =>
  import('components/NoPermissions/NoPermissions'),
);

const AddCluster = React.lazy(() =>
  import('components/Clusters/views/AddCluster/AddCluster'),
);

const NodeDetails = React.lazy(() =>
  import('components/Nodes/NodeDetails/NodeDetails'),
);

const ClusterOverview = React.lazy(() =>
  import('components/Clusters/views/ClusterOverview/ClusterOverview'),
);

export default function App() {
  const { cluster } = useMicrofrontendContext();
  return (
    // force rerender on cluster change
    <Switch key={cluster?.name}>
      <Route
        path="/no-permissions"
        exact
        component={withTitle(NO_PERMISSIONS_TITLE, NoPermissions)}
      />
      <Route
        path="/overview"
        exact
        component={withTitle(CLUSTER_OVERVIEW_TITLE, ClusterOverview)}
      />
      <Route path="/overview/nodes/:nodeName" component={RoutedNodeDetails} />
      <Route
        path="/clusters"
        exact
        component={withTitle(CLUSTERS_OVERVIEW_TITLE, ClusterList)}
      />
      <Route
        path="/clusters/add"
        exact
        component={withTitle(ADD_CLUSTER_TITLE, AddCluster)}
      />
      <Route
        path="/preferences"
        render={withTitle(PREFERENCES_TITLE, Preferences)}
      />
      <Route
        exact
        path="/apirules/create"
        render={withTitle(API_RULES_TITLE, CreateApiRule)}
      />

      <Route
        exact
        path="/apirules/edit/:apiName"
        render={withTitle(API_RULES_TITLE, RoutedEditApiRule)}
      />

      <Route
        exact
        path="/namespaces/:namespaceId/pods/:podName/containers/:containerName"
        component={RoutedContainerDetails}
      />

      <Route
        exact
        path="/customresourcedefinitions/:customResourceDefinitionName/:resourceVersion/:resourceName"
        component={RoutedCustomResourceDetails}
      />

      <Route
        exact
        path="/namespaces/:namespaceId/:resourceType/:resourceName"
        component={RoutedResourceDetails}
      />
      <Route
        exact
        path="/namespaces/:namespaceId/:resourceType"
        component={RoutedResourcesList}
      />
      <Route
        exact
        path="/:resourceType/:resourceName"
        component={RoutedResourceDetails}
      />

      <Route exact path="/:resourceType" component={RoutedResourcesList} />
    </Switch>
  );
}

function RoutedEditApiRule({ match }) {
  return <EditApiRule apiName={match.params.apiName} />;
}

function RoutedNodeDetails({ match }) {
  return <NodeDetails nodeName={match.params.nodeName} />;
}

function RoutedContainerDetails({ match }) {
  const decodedPodName = decodeURIComponent(match.params.podName);
  const decodedContainerName = decodeURIComponent(match.params.containerName);

  const params = {
    podName: decodedPodName,
    containerName: decodedContainerName,
    namespace: match.params.namespaceId,
  };

  return <ContainersLogs params={params} />;
}

function RoutedCustomResourceDetails({ match }) {
  const customResourceDefinitionName = decodeURIComponent(
    match.params.customResourceDefinitionName,
  );
  const resourceVersion = decodeURIComponent(match.params.resourceVersion);
  const resourceName = decodeURIComponent(match.params.resourceName);

  const params = {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
  };

  return <CustomResource params={params} />;
}

function RoutedResourcesList({ match }) {
  const queryParams = new URLSearchParams(window.location.search);

  const resourceUrl = getResourceUrl();

  const params = {
    hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: match.params.resourceType,
    namespace: match.params.namespaceId,
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

function RoutedResourceDetails({ match }) {
  const queryParams = new URLSearchParams(window.location.search);

  const resourceUrl = getResourceUrl();

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(match.params.resourceName);

  const params = {
    resourceUrl: decodedResourceUrl,
    resourceType: match.params.resourceType,
    resourceName: decodedResourceName,
    namespace: match.params.namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
  };

  const rendererName = params.resourceType + 'Details';

  return <ComponentForDetails name={rendererName} params={params} />;
}
