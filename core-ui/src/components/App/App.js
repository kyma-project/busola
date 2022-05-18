import React, { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import { MainFrameRedirection } from 'shared/components/MainFrameRedirection/MainFrameRedirection';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useSentry } from 'hooks/useSentry';

import { ExtensibilityDetails } from 'components/Extensibility/extensibilityDetails';
import { ExtensibilityList } from 'components/Extensibility/extensibilityList';

import { resourceRoutes } from 'resources';
import otherRoutes from 'resources/other';

export default function App() {
  const { cluster, language, customResources = [] } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

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
        const translationBundle = cr?.navigation?.path || 'extensibility';
        i18next.addResourceBundle(
          language,
          translationBundle,
          cr?.translations?.[language] || {},
        );
        if (cr.navigation?.scope === 'namespace') {
          return (
            <>
              <Route
                path={`/namespaces/:namespaceId/${cr.navigation.path}`}
                element={<ExtensibilityList />}
              />
              {cr.navigation.hasDetailsView && (
                <Route
                  path={`/namespaces/:namespaceId/${cr.navigation.path}/:resourceName`}
                  element={<ExtensibilityDetails />}
                />
              )}
            </>
          );
        } else {
          return (
            <>
              <Route
                path={`/${cr.navigation.path}`}
                element={<ExtensibilityList />}
              />
              {cr.navigation.hasDetailsView && (
                <Route
                  path={`/${cr.navigation.path}/:${cr.navigation.path}Name`}
                  element={<ExtensibilityDetails />}
                />
              )}
            </>
          );
        }
      })}

      {resourceRoutes}
      {otherRoutes}
      <Route path="" element={<MainFrameRedirection />} />
    </Routes>
  );
}
