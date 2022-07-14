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
import { Validator } from 'jsonschema';
import { schema } from './cm';

var v = new Validator();
var instance = {
  kind: 'ConfigMap',
  apiVersion: 'v1',
  metadata: {
    name: 1,
    namespace: 'default',
    uid: 'a525c333-6f54-4d3c-b388-0d516b0171b6',
    resourceVersion: '3322',
    creationTimestamp: '2022-06-23T12:14:25Z',
    labels: {
      'reconciler.kyma-project.io/managed-by': 'reconciler',
      'reconciler.kyma-project.io/origin-version': 'main',
      'reconciler.kyma-project.io/reconciliation-summary': 'true',
    },
    managedFields: [
      {
        manager: 'kyma',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2022-06-23T12:14:25Z',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:data': {
            '.': {},
            'f:last-reconciliation': {},
            'f:name': {},
            'f:status': {},
            'f:version': {},
          },
          'f:metadata': {
            'f:labels': {
              '.': {},
              'f:reconciler.kyma-project.io/managed-by': {},
              'f:reconciler.kyma-project.io/origin-version': {},
              'f:reconciler.kyma-project.io/reconciliation-summary': {},
            },
          },
        },
      },
    ],
  },
  data: {
    'last-reconciliation':
      '2022-06-23 14:14:30.390574 +0200 CEST m=+29.922578476',
    name: 'CRDs',
    status: 'success',
    version: 'main',
  },
};
console.log(v.validate(instance, schema));

export default function App() {
  return null;
}

export function App2() {
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
