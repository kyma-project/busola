import React, { Suspense } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Route, useParams } from 'react-router-dom';
import { getResourceUrl } from 'shared/helpers';
import { useTranslation } from 'react-i18next';
import { getPerResourceDefs } from 'shared/helpers/getResourceDefs';

export const createPath = (
  config = { namespaced: true, detailsView: false, pathSegment: '' },
) => {
  const { namespaced = true, detailsView = false, pathSegment = '' } = config;
  const namespacePrefix = namespaced ? '/namespaces/:namespaceId' : '';

  const details = detailsView ? '/:resourceName' : '';

  return `${namespacePrefix}/${pathSegment}${details}`;
};

export const usePrepareListProps = (resourceType, resourceI18Key) => {
  const routerParams = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const resourceUrl = getResourceUrl();
  return {
    hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: resourceType,
    resourceName: resourceI18Key ? t(resourceI18Key) : '',
    namespace: routerParams.namespaceId,
    i18n,
  };
};

let savedResourceGraph = null;
export const usePrepareDetailsProps = (resourceType, resourceI18Key) => {
  const { resourceName, namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const resourceUrl = getResourceUrl();

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(resourceName);

  const context = useMicrofrontendContext();
  if (!savedResourceGraph) {
    savedResourceGraph = getPerResourceDefs('resourceGraphConfig', t, context);
  }

  return {
    resourceUrl: decodedResourceUrl,
    resourceType: resourceType,
    resourceTitle: resourceI18Key ? t(resourceI18Key) : '',
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceGraphConfig: savedResourceGraph,
    i18n,
  };
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
  console.log({ List, Details });
  // define resourceI18Key when calling the function, to set a custom plural resource name, for example to fix the capitalization
  // const { namespaced = true, resourceType = '', resourceI18Key = '' } = config;

  const pathSegment = resourceType.toLowerCase();

  const listPath = createPath({ namespaced, pathSegment });
  const detailsPath = Details
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
    </>
  );
};
