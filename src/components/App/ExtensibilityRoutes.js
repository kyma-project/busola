import React, { Suspense, useEffect } from 'react';
import pluralize from 'pluralize';
import i18next from 'i18next';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';

import { usePrepareCreateProps } from 'resources/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

const List = React.lazy(() => import('../Extensibility/ExtensibilityList'));
const Details = React.lazy(() =>
  import('../Extensibility/ExtensibilityDetails'),
);
const Create = React.lazy(() => import('../Extensibility/ExtensibilityCreate'));

const ColumnWrapper = ({ defaultColumn = 'list', resourceType, cr }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

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

  let startColumnComponent = null;
  if ((!layout || !isColumnLeyoutEnabled) && defaultColumn === 'details') {
    startColumnComponent = (
      <Details resourceName={resourceName} namespaceId={namespaceId} />
    );
  } else {
    startColumnComponent = <List enableColumnLayout={isColumnLeyoutEnabled} />;
  }

  const elementCreateProps = usePrepareCreateProps({
    resourceType,
    apiGroup: cr?.general.resource.group,
    apiVersion: cr?.general.resource.version,
  });

  let midColumnComponent = null;
  if (layoutState?.showCreate?.resourceType) {
    midColumnComponent = (
      <ResourceCreate
        title={elementCreateProps.resourceTitle}
        confirmText={t('common.buttons.update')}
        renderForm={renderProps => {
          const createComponent = layoutState?.showCreate?.resourceType && (
            <Create
              resourceSchema={cr}
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
      startColumn={<div slot="">{startColumnComponent}</div>}
      midColumn={<div slot="">{midColumnComponent}</div>}
    />
  );
};

export const createExtensibilityRoutes = (cr, language, ...props) => {
  const urlPath =
    cr?.general?.urlPath ||
    pluralize(cr?.general?.resource?.kind?.toLowerCase() || '');

  const translationBundle = urlPath || 'extensibility';
  i18next.addResourceBundle(
    language,
    translationBundle,
    cr?.translations?.[language] || {},
  );

  return (
    <React.Fragment key={urlPath}>
      <Route
        path={urlPath}
        exact
        element={
          <Suspense fallback={<Spinner />}>
            <ColumnWrapper resourceType={urlPath} cr={cr} />
          </Suspense>
        }
      />
      {cr.details && (
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
