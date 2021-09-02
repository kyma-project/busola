import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';

import ServiceClassList from '../ServiceClassList/ServiceClassList';
import {
  ServiceClassDetailsContainer,
  ClusterServiceClassDetailsContainer,
} from '../ServiceClassDetails/ServiceClassDetails.container';
import ServiceInstancesList from '../ServiceInstanceList/ServiceInstanceList';
import ServiceInstancesDetails from '../ServiceInstanceDetails/ServiceInstanceDetails';
import {
  NotificationProvider,
  withTitle,
  MainFrameRedirection,
  useMicrofrontendContext,
} from 'react-shared';

import { CATALOG_TITLE, INSTANCES_TITLE } from '../../shared/constants';

const App = () => {
  const { language } = useMicrofrontendContext();
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);
  return (
    <NotificationProvider>
      <Switch>
        <Route path="/preload" component={() => null} />

        <Route
          exact
          path="/catalog"
          render={withTitle(CATALOG_TITLE, ServiceClassList)}
        />

        <Route
          exact
          path="/catalog/ServiceClass/:name"
          render={withTitle(CATALOG_TITLE, ({ match }) =>
            RoutedServiceClassDetails({ match, i18n }),
          )}
        />

        <Route
          exact
          path="/catalog/ClusterServiceClass/:name"
          render={withTitle(CATALOG_TITLE, ({ match }) =>
            RoutedClusterServiceClassDetails({ match, i18n }),
          )}
        />

        <Route
          exact
          path="/instances"
          render={withTitle(INSTANCES_TITLE, () =>
            ServiceInstancesList({ i18n }),
          )}
        />
        <Route
          exact
          path="/instances/details/:name"
          render={withTitle(INSTANCES_TITLE, ({ match }) =>
            ServiceInstancesDetails({ match, i18n }),
          )}
        />
        <Route exact path="" component={MainFrameRedirection} />
      </Switch>
    </NotificationProvider>
  );
};

const RoutedServiceClassDetails = ({ match, i18n }) => (
  <ServiceClassDetailsContainer name={match.params.name} i18n={i18n} />
);

const RoutedClusterServiceClassDetails = ({ match, i18n }) => (
  <ClusterServiceClassDetailsContainer name={match.params.name} i18n={i18n} />
);

export default App;
