import { Route } from 'react-router-dom';
import React, { Suspense } from 'react';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { usePrepareDetailsProps, usePrepareListProps } from './helpers';

const createPath = (
  config = { namespaced: true, detailsView: false, pathSegment: '' },
) => {
  const { namespaced = true, detailsView = false, pathSegment = '' } = config;
  const namespacePrefix = namespaced ? '/namespaces/:namespaceId' : '';

  const details = detailsView ? '/:resourceName' : '';

  return `${namespacePrefix}/${pathSegment}${details}`;
};

const ListWrapper = ({ children, resourceType, resourceI18Key }) => {
  const props = usePrepareListProps(resourceType, resourceI18Key);
  return React.cloneElement(children, props);
};
const DetailsWrapper = ({ children, resourceType, resourceI18Key }) => {
  const props = usePrepareDetailsProps(resourceType, resourceI18Key);
  return React.cloneElement(children, props);
};

export function createResourceRoutes({
  List = null,
  Details = null,
  // Create = null,
  namespaced = true,
  resourceType = '',
  resourceI18Key = '',
}) {
  // define resourceI18Key when calling the function, to set a custom plural resource name, for example to fix the capitalization
  // const { namespaced = true, resourceType = '', resourceI18Key = '' } = config;
  const pathSegment = resourceType.toLowerCase();

  const listPath = createPath({ namespaced, pathSegment });
  const detailsPath = Details
    ? createPath({ namespaced, pathSegment, detailsView: true })
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
              <List />
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
}
