import React, { useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import { MainFrameRedirection } from 'shared/components/MainFrameRedirection/MainFrameRedirection';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useSentry } from 'hooks/useSentry';
import { useAppTracking } from 'hooks/tracking';

import { ExtensibilityDetails } from 'components/Extensibility/ExtensibilityDetails';
import { ExtensibilityList } from 'components/Extensibility/ExtensibilityList';
import { useLoginWithKubeconfigID } from 'components/App/useLoginWithKubeconfigID';

import { resourceRoutes } from 'resources';
import otherRoutes from 'resources/other';

export default function App() {
  const { cluster, language, customResources = [] } = useMicrofrontendContext();
  const { t, i18n } = useTranslation();

  useLoginWithKubeconfigID();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useSentry();
  useAppTracking();

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
