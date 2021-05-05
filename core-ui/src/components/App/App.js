import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Route, Switch } from 'react-router-dom';

import Preferences from 'components/Preferences/Preferences';
import { PREFERENCES_TITLE } from '../../shared/constants';
import { withTitle, useMicrofrontendContext } from 'react-shared';
import CreateApiRule from '../ApiRules/CreateApiRule/CreateApiRule';
import EditApiRule from 'components/ApiRules/EditApiRule/EditApiRule';
import { ContainersLogs } from 'components/Predefined/Details/Pod/ContainersLogs';
import { ComponentForList, ComponentForDetails } from 'shared/getComponents';
import { API_RULES_TITLE } from 'shared/constants';
import { getResourceUrl } from 'shared/helpers';
import jsyaml from 'js-yaml';

export function ClusterList() {
  const { clusters, currentClusterName } = useMicrofrontendContext();
  if (!clusters) {
    return null;
  }

  function setCluster(clusterName) {
    LuigiClient.sendCustomMessage({
      id: 'busola.setCluster',
      clusterName,
    });
  }

  function deleteCluster(clusterName) {
    LuigiClient.sendCustomMessage({
      id: 'busola.deleteCluster',
      clusterName,
    });
  }

  return (
    <>
      <ul>
        {Object.entries(clusters).map(([clusterName, cluster]) => (
          <li key={clusterName}>
            {clusterName} {currentClusterName === clusterName && '*'}
            <button
              disabled={currentClusterName === clusterName}
              onClick={() => setCluster(clusterName)}
            >
              set
            </button>
            <button onClick={() => deleteCluster(clusterName)}>delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => LuigiClient.linkManager().navigate('add')}>
        nowy
      </button>
    </>
  );
}

function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
  });
}

export function AuthForm({ auth, setAuth }) {
  return (
    <div>
      <label>
        issuer
        <input
          value="https://apskyxzcl.accounts400.ondemand.com"
          onChange={e => setAuth({ ...auth, issuerUrl: e.target.value })}
        />
      </label>
      <label>
        Clientid
        <input
          value="d0316c58-b0fe-45cd-9960-0fea0708355a"
          onChange={e => setAuth({ ...auth, cliendId: e.target.value })}
        />
      </label>
      <label>
        scopes
        <input
          value="openid"
          onChange={e => setAuth({ ...auth, scope: e.target.value })}
        />
      </label>
    </div>
  );
}

export function AddCluster() {
  const [showNoAuth, setShowNoAuth] = React.useState(false);
  const [cluster, setCluster] = React.useState(null);
  const [auth, setAuth] = React.useState({
    issuerUrl: 'https://apskyxzcl.accounts400.ondemand.com',
    clientId: 'd0316c58-b0fe-45cd-9960-0fea0708355a',
    scope: 'openid',
  });

  async function onKubeconfigUploaded(file) {
    try {
      const kubeconfigParsed = jsyaml.load(await readFile(file));
      handleKubeconfigAdded(kubeconfigParsed);
    } catch (e) {
      alert(e);
      console.warn(e);
    }
  }

  function handleKubeconfigAdded(kubeconfig) {
    const clusterName = kubeconfig.clusters[0].name;
    try {
      const cluster = {
        name: clusterName,
        server: kubeconfig.clusters[0].cluster.server,
        'certificate-authority-data':
          kubeconfig.clusters[0].cluster['certificate-authority-data'],
      };
      const user = kubeconfig.users[0].user;
      const token = user.token;
      const clientCA = user['client-certificate-data'];
      const clientKeyData = user['client-key-data'];
      if (token || (clientCA && clientKeyData)) {
        const params = {
          cluster,
          rawAuth: {
            idToken: token,
            'client-certificate-data': clientCA,
            'client-key-data': clientKeyData,
          },
        };
        LuigiClient.sendCustomMessage({
          id: 'busola.addCluster',
          params,
        });
      } else {
        setShowNoAuth(true);
        setCluster(cluster);
      }
    } catch (e) {
      alert(e);
      console.warn(e);
    }
  }

  function dupa() {
    const params = {
      cluster,
      auth: { ...auth, responseType: 'id_token' },
    };
    console.log(params);
    LuigiClient.sendCustomMessage({
      id: 'busola.addCluster',
      params,
    });
  }

  return (
    <>
      <button onClick={() => LuigiClient.linkManager().navigate('/clusters')}>
        back
      </button>
      <input
        type="file"
        onChange={e => onKubeconfigUploaded(e.target.files[0])}
      />
      {showNoAuth && (
        <>
          <AuthForm auth={auth} setAuth={setAuth} />
          <button onClick={dupa}>dawaj</button>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/clusters" exact component={ClusterList} />
      <Route path="/clusters/add" exact component={AddCluster} />
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
