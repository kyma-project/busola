import React, { Suspense, useEffect, useMemo } from 'react';

import { useRecoilState } from 'recoil';
import { Route, useSearchParams, useParams } from 'react-router-dom';
import pluralize from 'pluralize';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';

import { columnLayoutState } from 'state/columnLayoutAtom';

import { Spinner } from 'shared/components/Spinner/Spinner';
import { usePrepareDetailsProps, usePrepareListProps } from './helpers';

import { useFeature } from 'hooks/useFeature';

export const createPath = (
  config = { detailsView: false, pathSegment: '' },
) => {
  const { detailsView = false, pathSegment = '' } = config;

  const details = detailsView ? '/:resourceName' : '';

  return `${pathSegment}${details}`;
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

const ColumnWrapper = ({ defaultColumn = 'list', list, details, ...props }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const {
    resourceName: resourceNameFromParams,
    namespaceId: namespaceIdFromParams,
  } = useParams();

  const resourceName = useMemo(
    () => props.resourceName ?? resourceNameFromParams,
    [props.resourceName, resourceNameFromParams],
  );
  const namespaceId = useMemo(
    () => props.namespaceId ?? namespaceIdFromParams,
    [props.namespaceId, namespaceIdFromParams],
  );

  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled && layout ? layout : layoutState?.layout,
        midColumn: {
          resourceName: resourceName,
          resourceType: props.resourceType,
          namespaceId: namespaceId,
        },
        endColumn: null,
      }
    : null;
  console.log(initialLayoutState);
  useEffect(() => {
    if (layout && resourceName && props.resourceType) {
      setLayoutColumn(initialLayoutState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    layout,
    isColumnLeyoutEnabled,
    namespaceId,
    resourceName,
    props.resourceType,
  ]);

  const elementListProps = usePrepareListProps({
    ...props,
  });
  const elementDetailsProps = usePrepareDetailsProps({
    ...props,
    customResourceName: layoutState?.midColumn?.resourceName ?? resourceName,
    customNamespaceId: layoutState?.midColumn?.namespaceId ?? namespaceId,
  });

  const listComponent = React.cloneElement(list, {
    ...elementListProps,
    enableColumnLayout:
      elementListProps.resourceType !== 'Namespaces'
        ? isColumnLeyoutEnabled
        : false,
  });

  const detailsComponent = React.cloneElement(details, {
    ...elementDetailsProps,
  });

  let startColumnComponent = null;

  if ((!layout || !isColumnLeyoutEnabled) && defaultColumn === 'details') {
    startColumnComponent = detailsComponent;
  } else {
    startColumnComponent = listComponent;
  }

  let midColumnComponent = null;

  //we have to set it ahead of time for the columns to not jump, but cannot render two Details components when we are directly on details page
  if (
    (layoutState?.midColumn || isColumnLeyoutEnabled) &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')
  ) {
    midColumnComponent = detailsComponent;
  }

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={
        !midColumnComponent ? 'OneColumn' : layoutState?.layout || 'OneColumn'
      }
      startColumn={<div>{startColumnComponent}</div>}
      midColumn={<div>{midColumnComponent}</div>}
    />
  );
};

export const createResourceRoutes = ({
  List = null,
  Details = null,
  namespaced = true,
  resourceType = '',
  resourceI18Key = '',
  ...props
}) => {
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
            <ColumnWrapper
              resourceType={resourceType}
              resourceI18Key={resourceI18Key}
              hasDetailsView={!!Details}
              list={<List allowSlashShortcut />}
              details={<Details />}
              {...props}
            >
              <List allowSlashShortcut />
            </ColumnWrapper>
          </Suspense>
        }
      />
      {detailsPath ? (
        <Route
          path={detailsPath}
          element={
            <Suspense fallback={<Spinner />}>
              <ColumnWrapper
                resourceType={resourceType}
                resourceI18Key={resourceI18Key}
                hasDetailsView={true}
                list={<List />}
                details={<Details />}
                defaultColumn="details"
                {...props}
              >
                <Details />
              </ColumnWrapper>
            </Suspense>
          }
        />
      ) : null}
    </React.Fragment>
  );
};
