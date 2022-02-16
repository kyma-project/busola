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
  useWindowTitle,
} from 'react-shared';

import { CATALOG_TITLE } from '../../shared/constants';

const App = () => {
  const { language } = useMicrofrontendContext();
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);
  return (
    <NotificationProvider>
      <Routes>
        <Route exact path="/catalog" element={<ServiceClassList />} />

        <Route
          exact
          path="/catalog/ServiceClass/:name"
          element={<RoutedServiceClassDetails />}
        />

        <Route
          exact
          path="/catalog/ClusterServiceClass/:name"
          element={<RoutedClusterServiceClassDetails />}
        />

        <Route exact path="/instances" element={<ServiceInstancesList />} />
        <Route
          exact
          path="/instances/details/:name"
          element={<ServiceInstancesDetails />}
        />
        <Route exact path="" element={<MainFrameRedirection />} />
      </Routes>
    </NotificationProvider>
  );
};

const RoutedServiceClassDetails = () => {
  const { name } = useParams();
  useWindowTitle(CATALOG_TITLE);
  return <ServiceClassDetailsContainer name={name} />;
};

const RoutedClusterServiceClassDetails = () => {
  const { name } = useParams();
  useWindowTitle(CATALOG_TITLE);
  return <ClusterServiceClassDetailsContainer name={name} />;
};

export default App;
