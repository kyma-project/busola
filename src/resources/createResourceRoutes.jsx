import { cloneElement, Fragment, Suspense } from 'react';

import { useAtomValue } from 'jotai';
import { Route, useParams, useSearchParams } from 'react-router';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { columnLayoutAtom } from 'state/columnLayoutAtom';

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
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';

export const createPath = (
  config = { detailsView: false, pathSegment: '' },
) => {
  const { detailsView = false, pathSegment = '' } = config;

  const details = detailsView ? '/:resourceName?' : '';

  return `${pathSegment}${details}`;
};

const ColumnWrapper = ({ list, details, create, ...props }) => {
  const layoutState = useAtomValue(columnLayoutAtom);
  const { resourceListUrl } = useUrl();

  const { t } = useTranslation();

  const { resourceName: resourceNameFromParams, namespaceId: rawNamespaceId } =
    useParams();
  const [searchParams] = useSearchParams();

  const resourceName = props.resourceName ?? resourceNameFromParams;
  const namespaceId =
    props.namespaceId ??
    (rawNamespaceId === '-all-'
      ? searchParams.get('resourceNamespace')
      : rawNamespaceId);

  usePrepareLayoutColumns({
    resourceType: props.resourceType,
    namespaceId: namespaceId,
    apiGroup: props.apiGroup,
    apiVersion: props.apiVersion,
    resourceName: resourceName,
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
    rawResourceTypeName: props.resourceType,
  });

  const defaultColumn = resourceName ? 'details' : 'list';

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

  const listComponent = cloneElement(list, {
    ...elementListProps,
    rawResourceType: props.resourceType,
    layoutCloseCreateUrl,
    enableColumnLayout: elementListProps.resourceType !== 'Namespaces',
  });
  const detailsComponent = cloneElement(details, {
    ...elementDetailsProps,
  });

  let startColumnComponent = null;

  if (layoutState.layout === 'OneColumn' && defaultColumn === 'details') {
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
      renderForm={(renderProps) => {
        const createComponent =
          create &&
          create?.type !== null &&
          (layoutState?.showCreate?.resourceType || props?.resourceType) &&
          cloneElement(create, {
            ...elementCreateProps,
            ...renderProps,
            enableColumnLayout: true,
            layoutNumber: 'startColumn',
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
        layout={layoutState?.layout}
        startColumn={
          <div className="column-content">{startColumnComponent}</div>
        }
        midColumn={
          <>
            {!layoutState?.showCreate &&
              (defaultColumn !== 'details' ||
                layoutState.layout !== 'OneColumn') && (
                <div className="column-content">{detailsMidColumn}</div>
              )}
            {!layoutState?.midColumn &&
              (defaultColumn !== 'details' ||
                layoutState.layout !== 'OneColumn') && (
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
  resourceType = '',
  resourceI18Key = '',
  customPath = null,
  ...props
}) => {
  const pathSegment = resourceType.toLowerCase();

  const path = customPath || createPath({ pathSegment, detailsView: true });

  return (
    <Fragment key={path}>
      <Route
        path={path}
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
    </Fragment>
  );
};
