import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useParams } from 'react-router-dom';

import ServiceClassList from '../ServiceClassList/ServiceClassList';
import {
  ServiceClassDetailsContainer,
  ClusterServiceClassDetailsContainer,
} from '../ServiceClassDetails/ServiceClassDetails.container';
import ServiceInstancesList from '../ServiceInstanceList/ServiceInstanceList';
import ServiceInstancesDetails from '../ServiceInstanceDetails/ServiceInstanceDetails';
import {
  NotificationProvider,
  MainFrameRedirection,
  useMicrofrontendContext,
  WithTitle,
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
      <Routes>
        <Route
          exact
          path="/catalog"
          element={
            <WithTitle title={CATALOG_TITLE}>
              <ServiceClassList />
            </WithTitle>
          }
        />

        <Route
          exact
          path="/catalog/ServiceClass/:name"
          element={
            <WithTitle title={CATALOG_TITLE}>
              <RoutedServiceClassDetails />
            </WithTitle>
          }
        />

        <Route
          exact
          path="/catalog/ClusterServiceClass/:name"
          element={
            <WithTitle title={CATALOG_TITLE}>
              <RoutedClusterServiceClassDetails />
            </WithTitle>
          }
        />

        <Route
          exact
          path="/instances"
          element={
            <WithTitle title={INSTANCES_TITLE}>
              <ServiceInstancesList />
            </WithTitle>
          }
        />
        <Route
          exact
          path="/instances/details/:name"
          element={
            <WithTitle title={INSTANCES_TITLE}>
              <ServiceInstancesDetails />
            </WithTitle>
          }
        />
        <Route exact path="" element={<MainFrameRedirection />} />
      </Routes>
    </NotificationProvider>
  );
};

const RoutedServiceClassDetails = () => {
  const { name } = useParams();
  return <ServiceClassDetailsContainer name={name} />;
};

const RoutedClusterServiceClassDetails = () => {
  const { name } = useParams();
  return <ClusterServiceClassDetailsContainer name={name} />;
};

export default App;
