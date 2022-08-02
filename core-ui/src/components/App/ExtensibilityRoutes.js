import React, { Suspense } from 'react';
import i18next from 'i18next';
import { Route } from 'react-router-dom';

import { Spinner } from 'shared/components/Spinner/Spinner';

export const createExtensibilityRoutes = (cr, language) => {
  const List = React.lazy(() => import('../Extensibility/ExtensibilityList'));
  const Details = React.lazy(() =>
    import('../Extensibility/ExtensibilityDetails'),
  );

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
          exact
          element={
            <Suspense fallback={<Spinner />}>
              <List />
            </Suspense>
          }
        />
        {cr.details && (
          <Route
            path={`/namespaces/:namespaceId/${cr.resource.path}/:resourceName`}
            exact
            element={
              <Suspense fallback={<Spinner />}>
                <Details />
              </Suspense>
            }
          />
        )}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment key={`cluster-${cr.resource?.path}`}>
        <Route
          path={`/${cr.resource.path}`}
          exact
          element={
            <Suspense fallback={<Spinner />}>
              <List />
            </Suspense>
          }
        />
        {cr.details && (
          <Route
            path={`/${cr.resource.path}/:resourceName`}
            exact
            element={
              <Suspense fallback={<Spinner />}>
                <Details />
              </Suspense>
            }
          />
        )}
      </React.Fragment>
    );
  }
};
