import { Fragment, Suspense } from 'react';
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
import { K8sResource } from 'types';
import FCLLayout from '@ui5/webcomponents-fiori/dist/types/FCLLayout';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

const List = lazyWithRetries(
  () => import('../Extensibility/ExtensibilityList'),
);
const Details = lazyWithRetries(
  () => import('../Extensibility/ExtensibilityDetails'),
);
const Create = lazyWithRetries(
  () => import('../Extensibility/ExtensibilityCreate'),
);

type ColumnWrapperProps = {
  resourceType?: string;
  extension?: Record<string, any>;
  urlPath?: string;
};

const ColumnWrapper = ({
  resourceType,
  extension,
  urlPath,
}: ColumnWrapperProps) => {
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
    isCustomResource: undefined,
    crName: undefined,
    isModule: undefined,
  });

  const overrides = { resourceType: urlPath };

  const layoutCloseCreateUrl = resourceListUrl(
    {
      kind: urlPath ?? resourceType,
      metadata: {
        namespace: layoutState?.midColumn?.namespaceId ?? namespaceId,
      },
    } as K8sResource,
    urlPath ? overrides : undefined,
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
    resourceCustomType: undefined,
  });

  const midColumnMatchesResource =
    layoutState?.midColumn?.resourceType === (urlPath ?? resourceType);

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
    midColumnMatchesResource &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')
  ) {
    midColumnComponent = (
      <Details
        resourceName={layoutState?.midColumn?.resourceName ?? resourceName}
        namespaceId={layoutState.midColumn?.namespaceId ?? namespaceId}
        resourceType={urlPath ?? resourceType}
      />
    );
  } else if (
    !layoutState?.showCreate &&
    !midColumnMatchesResource &&
    resourceName &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')
  ) {
    midColumnComponent = (
      <Details
        resourceName={resourceName}
        namespaceId={namespaceId}
        resourceType={urlPath ?? resourceType}
      />
    );
  }

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={
        (!midColumnComponent
          ? 'OneColumn'
          : layoutState?.layout || 'OneColumn') as
          | FCLLayout
          | keyof typeof FCLLayout
      }
      startColumn={<div className="column-content">{startColumnComponent}</div>}
      midColumn={<div className="column-content">{midColumnComponent}</div>}
    />
  );
};

export const createExtensibilityRoutes = (
  extension: Record<string, any>,
  language: string,
) => {
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
