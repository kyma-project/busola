import React, { Suspense, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { Route, useSearchParams } from 'react-router-dom';
import pluralize from 'pluralize';
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
import { EditResource } from 'shared/components/DynamicPageComponent/EditResource';

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

const ListWrapper = ({ children, details, create, ...props }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const layoutState = useRecoilValue(columnLayoutState);
  const { t } = useTranslation();
  console.log('!Create', create, 'resourceType', props.resourceType);

  const elementListProps = usePrepareListProps(props);
  const elementDetailsProps = usePrepareDetailsProps({
    ...props,
    customResourceName: layoutState?.midColumn?.resourceName,
    customNamespaceId: layoutState.midColumn?.namespaceId,
  });

  const elementCreateProps = usePrepareCreateProps({
    ...props,
  });

  const listComponent = React.cloneElement(children, {
    ...elementListProps,
    enableColumnLayout:
      elementListProps.resourceType !== 'Namespaces'
        ? isColumnLeyoutEnabled
        : false,
  });
  const detailsComponent = React.cloneElement(details, {
    ...elementDetailsProps,
  });

  console.log('elementCreateProps', elementCreateProps);
  let midColumnComponent = null;
  if (layoutState?.showCreate?.resourceType && create?.type !== null) {
    midColumnComponent = (
      <EditResource
        title={
          // createActionLabel ||
          t('components.resources-list.create', {
            resourceType: elementCreateProps.resourceTitle,
          })
        }
        confirmText={t('common.buttons.update')}
        renderForm={renderProps => {
          const createComponent =
            create?.type !== null &&
            layoutState?.showCreate?.resourceType &&
            React.cloneElement(create, {
              ...elementCreateProps,
              ...renderProps,
              enableColumnLayout: true,
            });
          return <ErrorBoundary>{createComponent}</ErrorBoundary>;
        }}
      />
    );
    // midColumnComponent = createComponent;
  }
  if (!layoutState?.showCreate && layoutState?.midColumn) {
    midColumnComponent = detailsComponent;
  }
  console.log('layoutState', layoutState);
  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={
        !midColumnComponent ? 'OneColumn' : layoutState?.layout || 'OneColumn'
      }
      startColumn={<div slot="">{listComponent}</div>}
      midColumn={<div slot="">{midColumnComponent}</div>}
    />
  );
};

const DetailsWrapper = ({ children, list, ...props }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);

  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled ? layout : 'OneColumn',
        midColumn: {
          resourceName: props.resourceName,
          resourceType: props.resourceType,
          namespaceId: props.namespaceId,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout && props.resourceName && props.resourceType) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, props.resourceName, props.resourceType, props.namespaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const elementListProps = usePrepareListProps({
    ...props,
    hasDetailsView: true,
  });
  const elementDetailsProps = usePrepareDetailsProps({
    ...props,
    customResourceName: layoutState?.midColumn?.resourceName,
    customNamespaceId: layoutState.midColumn?.namespaceId,
  });

  const listComponent = React.cloneElement(list, {
    ...elementListProps,
    enableColumnLayout:
      elementListProps.resourceType !== 'Namespaces'
        ? isColumnLeyoutEnabled
        : false,
  });
  const detailsComponent = React.cloneElement(children, {
    ...elementDetailsProps,
  });

  if (layout && isColumnLeyoutEnabled) {
    return (
      <FlexibleColumnLayout
        style={{ height: '100%' }}
        layout={layoutState?.layout || 'OneColumn'}
        startColumn={<div slot="">{listComponent}</div>}
        midColumn={<div slot="">{detailsComponent}</div>}
      />
    );
  }
  if (!layout || !isColumnLeyoutEnabled) return detailsComponent;
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
            <ListWrapper
              resourceType={resourceType}
              resourceI18Key={resourceI18Key}
              hasDetailsView={!!Details}
              details={<Details />}
              create={<Create />}
              {...props}
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
                list={<List />}
                create={<Create />}
                {...props}
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
