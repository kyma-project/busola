import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useParams } from 'react-router-dom';

import {
  ServiceClassDetailsContainer,
  ClusterServiceClassDetailsContainer,
} from '../ServiceClassDetails/ServiceClassDetails.container';
import {
  NotificationProvider,
  MainFrameRedirection,
  useMicrofrontendContext,
  WithTitle,
} from 'react-shared';

import { CATALOG_TITLE, INSTANCES_TITLE } from '../../shared/constants';
import './app.scss';

import ServiceInstancesList from '../ServiceInstanceList/ServiceInstanceList';
import ServiceClassList from '../ServiceClassList/ServiceClassList';
import ServiceInstanceDetails from '../../components/ServiceInstanceDetails/ServiceInstanceDetails';

const App = ({ id }) => {
  const isCatalog = id === 'catalog';
  const isInstances = id === 'instances';
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
          index={isCatalog}
          element={
            <WithTitle title={CATALOG_TITLE}>
              <ServiceClassList />
            </WithTitle>
          }
        />

        <Route
          exact
          path={isCatalog ? '/ServiceClass/:name' : null}
          element={
            <WithTitle title={CATALOG_TITLE}>
              <RoutedServiceClassDetails />
            </WithTitle>
          }
        />

        <Route
          exact
          path={isCatalog ? '/ClusterServiceClass/:name' : null}
          element={
            <WithTitle title={CATALOG_TITLE}>
              <RoutedClusterServiceClassDetails />
            </WithTitle>
          }
        />

        <Route
          exact
          index={isInstances}
          element={
            <WithTitle title={INSTANCES_TITLE}>
              <ServiceInstancesList />
            </WithTitle>
          }
        />
        <Route
          exact
          path={isInstances ? '/details/:name' : null}
          element={
            <WithTitle title={INSTANCES_TITLE}>
              <ServiceInstanceDetails />
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
