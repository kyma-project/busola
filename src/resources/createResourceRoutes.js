import React, { Suspense, useEffect, useMemo } from 'react';

import { useRecoilState } from 'recoil';
import {
  NavigationType,
  Route,
  useNavigationType,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { columnLayoutState } from 'state/columnLayoutAtom';

import { Spinner } from 'shared/components/Spinner/Spinner';
import {
  usePrepareCreateProps,
  usePrepareDetailsProps,
  usePrepareListProps,
} from './helpers';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useUrl } from 'hooks/useUrl';
import { useGetSchema } from 'hooks/useGetSchema';
import { SchemaContext } from 'shared/helpers/schema';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';

export const createPath = (
  config = { detailsView: false, pathSegment: '' },
) => {
  const { detailsView = false, pathSegment = '' } = config;

  const details = detailsView ? '/:resourceName' : '';

  return `${pathSegment}${details}`;
};

const ColumnWrapper = ({
  defaultColumn = 'list',
  list,
  details,
  create,
  ...props
}) => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const navigationType = useNavigationType();
  const { resourceListUrl } = useUrl();

  const { t } = useTranslation();

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

  const newLayoutState = useMemo(() => {
    return layout
      ? {
          layout: layout,
          startColumn: {
            resourceType: props.resourceType,
            namespaceId: namespaceId,
            apiGroup: props.apiGroup,
            apiVersion: props.apiVersion,
          },
          midColumn: {
            resourceName: resourceName,
            resourceType: props.resourceType,
            namespaceId: namespaceId,
            apiGroup: props.apiGroup,
            apiVersion: props.apiVersion,
          },
          endColumn: null,
          showCreate: null,
        }
      : {
          layout: 'OneColumn',
          startColumn: {
            resourceType: props.resourceType,
            namespaceId: namespaceId,
            apiGroup: props.apiGroup,
            apiVersion: props.apiVersion,
          },
          midColumn: null,
          endColumn: null,
          showCreate: null,
        };
  }, [
    layout,
    props.resourceType,
    namespaceId,
    props.apiGroup,
    props.apiVersion,
    resourceName,
  ]);

  useEffect(() => {
    if (navigationType === NavigationType.Pop) {
      setLayoutColumn(newLayoutState);
    }
  }, [newLayoutState, setLayoutColumn, navigationType]);

  useEffect(() => {
    setLayoutColumn(newLayoutState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const layoutCloseCreateUrl = resourceListUrl({
    kind: props.resourceType,
    metadata: {
      namespace: layoutState?.midColumn?.namespaceId ?? namespaceId,
    },
  });

  const elementListProps = usePrepareListProps({
    resourceCustomType: props.resourceCustomType,
    resourceType: props.resourceType,
    resourceI18Key: props.resourceI18Key,
    apiGroup: props.apiGroup,
    apiVersion: props.apiVersion,
    hasDetailsView: props.hasDetailsView,
  });

  const elementDetailsProps = usePrepareDetailsProps({
    resourceCustomType: props.resourceCustomType,
    resourceType: props.resourceType,
    resourceI18Key: props.resourceI18Key,
    apiGroup: props.apiGroup,
    apiVersion: props.apiVersion,
    resourceName: layoutState?.midColumn?.resourceName ?? resourceName,
    namespaceId: layoutState?.midColumn?.namespaceId ?? namespaceId,
    showYamlTab: props.showYamlTab,
  });

  const elementCreateProps = usePrepareCreateProps({
    resourceCustomType: props.resourceCustomType,
    resourceType: props.resourceType,
    apiGroup: props.apiGroup,
    apiVersion: props.apiVersion,
  });

  const listComponent = React.cloneElement(list, {
    ...elementListProps,
    layoutCloseCreateUrl,
    enableColumnLayout: elementListProps.resourceType !== 'Namespaces',
  });
  const detailsComponent = React.cloneElement(details, {
    ...elementDetailsProps,
  });

  let startColumnComponent = null;

  if (!layout && defaultColumn === 'details') {
    startColumnComponent = detailsComponent;
  } else {
    startColumnComponent = listComponent;
  }

  let detailsMidColumn = null;
  if (
    !layoutState?.showCreate &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')
  ) {
    detailsMidColumn = detailsComponent;
  }

  const { schema } = useGetSchema({
    resource: {
      group: props?.apiGroup,
      version: props.apiVersion,
      kind: props?.resourceType.slice(0, -1),
    },
  });

  const createMidColumn = (
    <ResourceCreate
      title={elementCreateProps.resourceTitle}
      confirmText={t('common.buttons.create')}
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      renderForm={renderProps => {
        const createComponent =
          create &&
          create?.type !== null &&
          (layoutState?.showCreate?.resourceType || props?.resourceType) &&
          React.cloneElement(create, {
            ...elementCreateProps,
            ...renderProps,
            enableColumnLayout: true,
            layoutNumber: 'StartColumn',
            resource: layoutState?.showCreate?.resource, // For ResourceCreate we want to set layoutNumber to previous column so detail are opened instead of create
          });
        return <ErrorBoundary>{createComponent}</ErrorBoundary>;
      }}
    />
  );

  return (
    <SchemaContext.Provider value={schema || null}>
      <FlexibleColumnLayout
        style={{ height: '100%' }}
        layout={layoutState?.layout || 'OneColumn'}
        startColumn={
          <div className="column-content">{startColumnComponent}</div>
        }
        midColumn={
          <>
            {!layoutState?.showCreate &&
              (defaultColumn !== 'details' || layout) && (
                <div className="column-content">{detailsMidColumn}</div>
              )}
            {!layoutState?.midColumn &&
              (defaultColumn !== 'details' || layout) && (
                <div className="column-content">{createMidColumn}</div>
              )}
          </>
        }
      />
    </SchemaContext.Provider>
  );
};

export const createResourceRoutes = ({
  List = null,
  Details = null,
  Create = null,
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
              create={Create ? <Create /> : null}
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
                create={Create ? <Create /> : null}
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
