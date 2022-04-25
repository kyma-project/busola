import React, { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MainFrameRedirection } from 'shared/components/MainFrameRedirection/MainFrameRedirection';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useSentry } from 'hooks/useSentry';

import { resourceRoutes } from 'resources';
import otherRoutes from 'resources/other';
import { fetchCache, loadCacheItem, saveCacheItem } from 'fetch-cache';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import loki, { LokiIndexedAdapter } from 'lokijs';

window.loki = loki;

// window.db = new loki('busola.db');
// console.log(window.db.collections);
// window.db.addCollection('cukierki');
// console.log(window.db.collections);
console.log(LokiIndexedAdapter);

export default function App() {
  const {
    authData,
    cluster,
    config,
    ssoData,
    language,
  } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    if (cluster) {
      console.log('init core-ui cache for', cluster.name);
      fetchCache.init({
        getCacheItem: path => loadCacheItem(cluster.name, path),
        setCacheItem: (path, item) => saveCacheItem(cluster.name, path, item),
        fetchOptions: {
          headers: createHeaders(
            authData,
            cluster.cluster,
            config.requiresCA,
            ssoData,
          ),
        },
      });
    }
  }, [cluster?.name, ssoData, config?.requiresCA]); //todo add authData

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
        path="/overview" // overview route should stay static
        element={
          <WithTitle title={t('clusters.overview.title-current-cluster')}>
            <ClusterOverview />
          </WithTitle>
        }
      />
      {resourceRoutes}
      {otherRoutes}
      <Route path="" element={<MainFrameRedirection />} />
    </Routes>
  );
}
