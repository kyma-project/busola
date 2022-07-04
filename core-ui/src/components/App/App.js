import React, { useEffect, useMemo } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import { MainFrameRedirection } from 'shared/components/MainFrameRedirection/MainFrameRedirection';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useSentry } from 'hooks/useSentry';

import { ExtensibilityDetails } from 'components/Extensibility/ExtensibilityDetails';
import { ExtensibilityList } from 'components/Extensibility/ExtensibilityList';
import { baseUrl } from 'shared/hooks/BackendAPI/config';

import { resourceRoutes } from 'resources';
import otherRoutes from 'resources/other';
import { useConfig } from 'shared/contexts/ConfigContext';

export default function App() {
  const { cluster, language, customResources = [] } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

  const location = useLocation();
  const { fromConfig } = useConfig();
  useEffect(() => {
    let log;
    if (location.pathname.includes('/namespaces/')) {
      if (
        new RegExp('/namespaces/[a-z0-9-]+/?(details)?$').test(
          location.pathname,
        )
      ) {
        log = 'namespaces';
      } else {
        log = location.pathname.replace(new RegExp('/namespaces/.*?/'), '');
      }
    } else {
      log = location.pathname.substring(1);
    }
    let tab = log.split('/');
    if (tab.length > 1) {
      log = 'PATH:DETAILS ' + tab[0];
    } else {
      log = 'PATH:LIST ' + tab[0];
    }
    fetch(baseUrl(fromConfig) + '/tracking', {
      method: 'POST',
      body: log,
    }).catch(console.log);
  }, [fromConfig, location]);

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
        path="/overview" // overview route should stay static
        element={
          <WithTitle title={t('clusters.overview.title-current-cluster')}>
            <ClusterOverview />
          </WithTitle>
        }
      />

      {customResources?.map(cr => {
        const translationBundle = cr?.resource?.path || 'extensibility';
        i18next.addResourceBundle(
          language,
          translationBundle,
          cr?.translations?.[language] || {},
        );
        if (cr.resource?.scope === 'namespace') {
          return (
            <React.Fragment key={`namespace-${cr.resource?.path}`}>
              <Route
                path={`/namespaces/:namespaceId/${cr.resource.path}`}
                element={<ExtensibilityList />}
              />
              {cr.details && (
                <Route
                  path={`/namespaces/:namespaceId/${cr.resource.path}/:resourceName`}
                  element={<ExtensibilityDetails />}
                />
              )}
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={`cluster-${cr.resource?.path}`}>
              <Route
                path={`/${cr.resource.path}`}
                element={<ExtensibilityList />}
              />
              {cr.details && (
                <Route
                  path={`/${cr.resource.path}/:resourceName`}
                  element={<ExtensibilityDetails />}
                />
              )}
            </React.Fragment>
          );
        }
      })}

      {resourceRoutes}
      {otherRoutes}
      <Route path="" element={<MainFrameRedirection />} />
    </Routes>
  );
}
