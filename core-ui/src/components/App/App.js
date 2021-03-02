import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Preferences from 'components/Preferences/Preferences';

import { PREFERENCES_TITLE } from '../../shared/constants';
import { withTitle } from 'react-shared';
import CreateApiRule from '../ApiRules/CreateApiRule/CreateApiRule';
import EditApiRule from 'components/ApiRules/EditApiRule/EditApiRule';
import {
  getComponentForList,
  getComponentForDetails,
} from 'shared/getComponents';
import { API_RULES_TITLE } from 'shared/constants';
export default function App() {
  return (
    <Switch>
      <Route path="/preload" component={() => null} />
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

function RoutedResourcesList({ match }) {
  const queryParams = new URLSearchParams(window.location.search);
  const resourceUrl =
    queryParams.get('resourceApiPath') + window.location.pathname;

  const params = {
    hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    resourceUrl,
    resourceType: match.params.resourceType,
    namespace: match.params.namespaceId,
  };

  const rendererName =
    params.resourceType[0].toUpperCase() +
    params.resourceType.substr(1) +
    'List';

  return getComponentForList(rendererName, params);
}

function RoutedResourceDetails({ match }) {
  const queryParams = new URLSearchParams(window.location.search);
  const resourceUrl =
    queryParams.get('resourceApiPath') + window.location.pathname;

  const params = {
    resourceUrl,
    resourceType: match.params.resourceType,
    resourceName: match.params.resourceName,
    namespace: match.params.namespaceId,
  };

  const rendererName =
    params.resourceType[0].toUpperCase() +
    params.resourceType.substr(1) +
    'Details';

  return getComponentForDetails(rendererName, params);
}
