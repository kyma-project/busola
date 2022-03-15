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

export const usePrepareListProps = (resourceType, resourceName) => {
  const routerParams = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n } = useTranslation();
  const resourceUrl = getResourceUrl();
  console.log(resourceName);
  return {
    hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: resourceType,
    resourceName,
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

const ListWrapper = ({ children, resourceType, resourceName }) => {
  const props = usePrepareListProps(resourceType, resourceName);
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
    resourceName: '',
  },
) => {
  // use resourceName to set custom list name, for example to fix capitalization
  const { namespaced = true, resourceType = '', resourceName = '' } = config;

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
            <ListWrapper
              resourceType={resourceType}
              resourceName={resourceName}
            >
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
