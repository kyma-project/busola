import { lazy, Fragment, Suspense } from 'react';
import pluralize from 'pluralize';
import i18next from 'i18next';
import { Route, useParams, useSearchParams } from 'react-router';
import { useAtomValue } from 'jotai';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';

import { usePrepareCreateProps } from 'resources/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';

const List = lazy(() => import('../Extensibility/ExtensibilityList'));
const Details = lazy(() => import('../Extensibility/ExtensibilityDetails'));
const Create = lazy(() => import('../Extensibility/ExtensibilityCreate'));

const ColumnWrapper = ({ resourceType, extension, urlPath }) => {
  const layoutState = useAtomValue(columnLayoutAtom);
  const { resourceListUrl } = useUrl();

  const { t } = useTranslation();

  const { namespaceId: rawNamespaceId, resourceName } = useParams();
  const [searchParams] = useSearchParams();
  const namespaceId =
    rawNamespaceId === '-all-'
      ? searchParams.get('resourceNamespace')
      : rawNamespaceId;

  const defaultColumn = resourceName ? 'details' : 'list';

  usePrepareLayoutColumns({
    resourceType: urlPath ?? resourceType,
    namespaceId: namespaceId,
    apiGroup: extension?.general.resource.group,
    apiVersion: extension?.general.resource.version,
    resourceName: resourceName,
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
    rawResourceTypeName: extension?.general?.resource?.kind,
  });

  const overrides = { resourceType: urlPath };

  const layoutCloseCreateUrl = resourceListUrl(
    {
      kind: urlPath ?? resourceType,
      metadata: {
        namespace: layoutState?.midColumn?.namespaceId ?? namespaceId,
      },
    },
    urlPath ? overrides : null,
  );

  let startColumnComponent = null;
  if (layoutState.layout === 'OneColumn' && defaultColumn === 'details') {
    startColumnComponent = (
      <Details
        resourceName={resourceName}
        namespaceId={namespaceId}
        resourceType={urlPath ?? resourceType}
      />
    );
  } else {
    startColumnComponent = (
      <List
        rawResourceType={extension?.general?.resource?.kind}
        layoutCloseCreateUrl={layoutCloseCreateUrl}
        enableColumnLayout={true}
      />
    );
  }

  const elementCreateProps = usePrepareCreateProps({
    resourceType,
    resourceTypeForTitle: extension?.general?.name,
    apiGroup: extension?.general.resource.group,
    apiVersion: extension?.general.resource.version,
  });

  let midColumnComponent = null;

  if (layoutState?.showCreate?.resourceType) {
    midColumnComponent = (
      <ResourceCreate
        title={elementCreateProps.resourceTitle}
        confirmText={t('common.buttons.create')}
        layoutCloseCreateUrl={layoutCloseCreateUrl}
        renderForm={(renderProps) => {
          const createComponent = layoutState?.showCreate?.resourceType && (
            <Create
              resourceSchema={extension}
              layoutNumber="startColumn"
              {...elementCreateProps}
              {...renderProps}
            />
          );

          return <ErrorBoundary>{createComponent}</ErrorBoundary>;
        }}
      />
    );
  }

  if (
    !layoutState?.showCreate &&
    layoutState?.midColumn &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')
  ) {
    midColumnComponent = (
      <Details
        resourceName={layoutState?.midColumn?.resourceName ?? resourceName}
        namespaceId={layoutState.midColumn?.namespaceId ?? namespaceId}
        resourceType={urlPath ?? resourceType}
      />
    );
  }

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={
        !midColumnComponent ? 'OneColumn' : layoutState?.layout || 'OneColumn'
      }
      startColumn={<div className="column-content">{startColumnComponent}</div>}
      midColumn={<div className="column-content">{midColumnComponent}</div>}
    />
  );
};

export const createExtensibilityRoutes = (extension, language) => {
  const urlPath =
    extension?.general?.urlPath ||
    pluralize(extension?.general?.resource?.kind?.toLowerCase() || '');

  const resourceType = pluralize(
    extension?.general?.resource?.kind?.toLowerCase() || '',
  );

  const translationBundle = urlPath || 'extensibility';
  i18next.addResourceBundle(
    language,
    translationBundle,
    extension?.translations?.[language] || {},
  );

  return (
    <Fragment key={urlPath}>
      <Route
        path={`${urlPath}/:resourceName?`}
        element={
          <Suspense fallback={<Spinner />}>
            <ColumnWrapper
              resourceType={resourceType}
              extension={extension}
              urlPath={urlPath}
            />
          </Suspense>
        }
      />
    </Fragment>
  );
};
