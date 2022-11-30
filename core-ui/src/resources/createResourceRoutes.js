import React, { Suspense } from 'react';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { usePrepareDetailsProps, usePrepareListProps } from './helpers';
import { Route } from 'react-router-dom';
import pluralize from 'pluralize';
import LuigiClient from '@luigi-project/client';

export const createPath = (
  config = { detailsView: false, pathSegment: '' },
) => {
  const { detailsView = false, pathSegment = '' } = config;

  const details = detailsView ? '/:resourceName' : '';

  return `${pathSegment}${details}`;
};

export const luigiNavigate = (node, namespace) => {
  const path = node.createUrlFn
    ? node.createUrlFn(namespace)
    : createUrl(node, namespace);

  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(path);
};

export const createUrl = (
  { resourceType, pathSegment, namespaced, resourceName },
  namespace,
) => {
  const namespacePrefix = namespaced ? `/namespaces/${namespace}` : '';
  const details = resourceName || '';
  pathSegment = pathSegment || pluralize(resourceType).toLowerCase();

  return `${namespacePrefix}/${pathSegment}/${details}`;
};

export const createKubernetesUrl = ({
  resourceType,
  namespace,
  resourceName,
  apiGroup = '',
  apiVersion,
}) => {
  const namespaceSegment = namespace ? `namespaces/${namespace}/` : '';
  const details = resourceName || '';
  const apiPrefix = apiGroup ? 'apis/' : 'api';
  resourceType = pluralize(resourceType).toLowerCase();

  return `${apiPrefix}${apiGroup}/${apiVersion}/${namespaceSegment}${resourceType}/${details}`;
};

const ListWrapper = ({ children, resourceType, resourceI18Key }) => {
  const props = usePrepareListProps(resourceType, resourceI18Key);
  return React.cloneElement(children, props);
};
const DetailsWrapper = ({ children, resourceType, resourceI18Key }) => {
  const props = usePrepareDetailsProps(resourceType, resourceI18Key);
  return React.cloneElement(children, props);
};

export const createResourceRoutes = ({
  List = null,
  Details = null,
  // Create = null,
  namespaced = true,
  resourceType = '',
  resourceI18Key = '',
}) => {
  // define resourceI18Key when calling the function, to set a custom plural resource name, for example to fix the capitalization
  // const { namespaced = true, resourceType = '', resourceI18Key = '' } = config;

  const pathSegment = resourceType.toLowerCase();

  const listPath = createPath({ pathSegment });
  const detailsPath = Details
    ? createPath({ pathSegment, detailsView: true })
    : '';
  return (
    <React.Fragment key={listPath}>
      <Route
        path={listPath}
        exact
        element={
          <Suspense fallback={<Spinner />}>
            <ListWrapper
              resourceType={resourceType}
              resourceI18Key={resourceI18Key}
            >
              <List allowSlashShortcut />
            </ListWrapper>
          </Suspense>
        }
      />
      {detailsPath ? (
        <Route
          path={detailsPath}
          element={
            <Suspense fallback={<Spinner />}>
              <DetailsWrapper
                resourceType={resourceType}
                resourceI18Key={resourceI18Key}
              >
                <Details />
              </DetailsWrapper>
            </Suspense>
          }
        />
      ) : null}
    </React.Fragment>
  );
};
