import React, { Suspense } from 'react';
import { ResourcesList, ResourceDetails, Spinner } from 'react-shared';
import { Route, useParams } from 'react-router-dom';
import { getResourceUrl } from 'shared/helpers';
import { useTranslation } from 'react-i18next';

export const createPath = (
  config = { namespaced: true, detailsView: false, pathSegment: '' },
) => {
  const { namespaced = true, detailsView = false, pathSegment = '' } = config;
  const namespacePrefix = namespaced ? '/namespaces/:namespaceId' : '';

  const details = detailsView ? '/:resourceName' : '';

  return `${namespacePrefix}/${pathSegment}${details}`;
};

export const usePrepareListProps = resourceType => {
  const routerParams = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n } = useTranslation();
  const resourceUrl = getResourceUrl();
  return {
    DefaultRenderer: ResourcesList,
    hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: resourceType,
    namespace: routerParams.namespaceId,
    i18n,
  };
};

export const usePrepareDetailsProps = resourceType => {
  const { resourceName, namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n } = useTranslation();
  const resourceUrl = getResourceUrl();

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(resourceName);

  return {
    DefaultRenderer: ResourceDetails,
    resourceUrl: decodedResourceUrl,
    resourceType: resourceType,
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    i18n,
  };
};

export const createResourceRoutes = (
  Components = { List: null, Details: null },
  config = {
    namespaced: true,
    pathSegment: '',
  },
) => {
  const { namespaced = true, pathSegment = '' } = config;

  const listPath = createPath({ namespaced, pathSegment });
  const detailsPath = Components.List
    ? createPath({ namespaced, pathSegment, detailsView: true })
    : '';

  return (
    <>
      <Route
        path={listPath}
        exact
        element={
          <Suspense fallback={<Spinner />}>
            <Components.List />
          </Suspense>
        }
      />
      {detailsPath ? (
        <Route
          path={detailsPath}
          element={
            <Suspense fallback={<Spinner />}>
              <Components.Details />
            </Suspense>
          }
        />
      ) : null}
    </>
  );
};
