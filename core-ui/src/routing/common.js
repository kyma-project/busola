import React, { Suspense } from 'react';
import { Spinner } from 'react-shared';
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
    resourceUrl: decodedResourceUrl,
    resourceType: resourceType,
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    i18n,
  };
};

const ListWrapper = ({ children, resourceType }) => {
  const props = usePrepareListProps(resourceType);
  return React.cloneElement(children, props);
};
const DetailsWrapper = ({ children, resourceType }) => {
  const props = usePrepareDetailsProps(resourceType);
  return React.cloneElement(children, props);
};

export const createResourceRoutes = (
  Components = { List: null, Details: null },
  config = {
    namespaced: true,
    resourceType: '',
  },
) => {
  const { namespaced = true, resourceType = '' } = config;

  const pathSegment = resourceType.toLowerCase();

  const listPath = createPath({ namespaced, pathSegment });
  const detailsPath = Components.Details
    ? createPath({ namespaced, pathSegment, detailsView: true })
    : '';

  return (
    <>
      <Route
        path={listPath}
        exact
        element={
          <Suspense fallback={<Spinner />}>
            <ListWrapper resourceType={resourceType}>
              <Components.List />
            </ListWrapper>
          </Suspense>
        }
      />
      {detailsPath ? (
        <Route
          path={detailsPath}
          element={
            <Suspense fallback={<Spinner />}>
              <DetailsWrapper resourceType={resourceType}>
                <Components.Details />
              </DetailsWrapper>
            </Suspense>
          }
        />
      ) : null}
    </>
  );
};
