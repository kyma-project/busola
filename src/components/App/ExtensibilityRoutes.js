import React, { Suspense, useEffect } from 'react';
import pluralize from 'pluralize';
import i18next from 'i18next';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';
import { useUrl } from 'hooks/useUrl';

import { usePrepareCreateProps } from 'resources/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

const List = React.lazy(() => import('../Extensibility/ExtensibilityList'));
const Details = React.lazy(() =>
  import('../Extensibility/ExtensibilityDetails'),
);
const Create = React.lazy(() => import('../Extensibility/ExtensibilityCreate'));

const ColumnWrapper = ({ defaultColumn = 'list', resourceType, extension }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const { resourceListUrl } = useUrl();

  const { t } = useTranslation();

  const { namespaceId, resourceName } = useParams();
  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled && layout ? layout : layoutState?.layout,
        midColumn: {
          resourceName: resourceName,
          resourceType: resourceType,
          namespaceId: namespaceId,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout && resourceName && resourceType) {
      setLayoutColumn(initialLayoutState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, isColumnLeyoutEnabled, namespaceId, resourceName, resourceType]);

  const layoutCloseCreateUrl = resourceListUrl({
    kind: resourceType,
    metadata: {
      namespace: layoutState?.midColumn?.namespaceId ?? namespaceId,
    },
  });

  let startColumnComponent = null;
  if ((!layout || !isColumnLeyoutEnabled) && defaultColumn === 'details') {
    startColumnComponent = (
      <Details resourceName={resourceName} namespaceId={namespaceId} />
    );
  } else {
    startColumnComponent = (
      <List
        enableColumnLayout={isColumnLeyoutEnabled}
        layoutCloseCreateUrl={layoutCloseCreateUrl}
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
        confirmText={t('common.buttons.save')}
        layoutCloseCreateUrl={layoutCloseCreateUrl}
        renderForm={renderProps => {
          const createComponent = layoutState?.showCreate?.resourceType && (
            <Create
              resourceSchema={extension}
              layoutNumber="StartColumn"
              {...elementCreateProps}
              {...renderProps}
            />
          );

          return <ErrorBoundary>{createComponent}</ErrorBoundary>;
        }}
      />
    );
  }

  if (!layoutState?.showCreate && layoutState?.midColumn) {
    midColumnComponent = (
      <Details
        resourceName={layoutState?.midColumn?.resourceName ?? resourceName}
        namespaceId={layoutState.midColumn?.namespaceId ?? namespaceId}
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

export const createExtensibilityRoutes = (extension, language, ...props) => {
  const urlPath =
    extension?.general?.urlPath ||
    pluralize(extension?.general?.resource?.kind?.toLowerCase() || '');

  const translationBundle = urlPath || 'extensibility';
  i18next.addResourceBundle(
    language,
    translationBundle,
    extension?.translations?.[language] || {},
  );

  return (
    <React.Fragment key={urlPath}>
      <Route
        path={urlPath}
        exact
        element={
          <Suspense fallback={<Spinner />}>
            <ColumnWrapper resourceType={urlPath} extension={extension} />
          </Suspense>
        }
      />
      {extension.details && (
        <Route
          path={`${urlPath}/:resourceName`}
          exact
          element={
            <Suspense fallback={<Spinner />}>
              <ColumnWrapper defaultColumn="details" resourceType={urlPath} />
            </Suspense>
          }
        />
      )}
    </React.Fragment>
  );
};
