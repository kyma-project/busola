import React, { Suspense } from 'react';
import i18next from 'i18next';
import { Route } from 'react-router-dom';

import { Spinner } from 'shared/components/Spinner/Spinner';

const List = React.lazy(() => import('../Extensibility/ExtensibilityList'));
const Details = React.lazy(() =>
  import('../Extensibility/ExtensibilityDetails'),
);

export const createExtensibilityRoutes = (cr, language, namespaced) => {
  const urlPath = cr?.general?.urlPath;

  const translationBundle = urlPath || 'extensibility';
  i18next.addResourceBundle(
    language,
    translationBundle,
    cr?.translations?.[language] || {},
  );

  if (cr.general?.scope === 'namespace' && namespaced) {
    return (
      <React.Fragment key={`namespace-${urlPath}`}>
        <Route
          path={urlPath}
          exact
          element={
            <Suspense fallback={<Spinner />}>
              <List />
            </Suspense>
          }
        />
        {cr.details && (
          <Route
            path={`${urlPath}/:resourceName`}
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
      <React.Fragment key={`cluster-${urlPath}`}>
        <Route
          path={`${urlPath}`}
          exact
          element={
            <Suspense fallback={<Spinner />}>
              <List />
            </Suspense>
          }
        />
        {cr.details && (
          <Route
            path={`${urlPath}/:resourceName`}
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
