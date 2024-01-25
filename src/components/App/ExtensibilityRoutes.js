import React, { Suspense, useEffect } from 'react';
import pluralize from 'pluralize';
import i18next from 'i18next';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';

import { Spinner } from 'shared/components/Spinner/Spinner';

const List = React.lazy(() => import('../Extensibility/ExtensibilityList'));
const Details = React.lazy(() =>
  import('../Extensibility/ExtensibilityDetails'),
);

const ColumnWrapper = ({ defaultColumn = 'list', resourceType }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const { namespaceId, resourceName } = useParams();
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const initialLayoutState = layout
    ? {
        layout: layout,
        midColumn: {
          resourceName: resourceName,
          resourceType: resourceType,
          namespaceId: namespaceId,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, namespaceId, resourceName, resourceType]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isColumnLeyoutEnabled && defaultColumn === 'details') {
    return (
      <Details
        customResourceName={resourceName}
        customNamespaceId={namespaceId}
      />
    );
  }
  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={
        <div slot="">
          {(layout || defaultColumn === 'list') && (
            <List enableColumnLayout={isColumnLeyoutEnabled} />
          )}
          {!layout && defaultColumn === 'details' && (
            <Details
              customResourceName={layoutState?.midColumn?.resourceName}
              customNamespaceId={layoutState.midColumn?.namespaceId}
            />
          )}
        </div>
      }
      midColumn={
        layoutState?.midColumn && (
          <div slot="">
            <Details
              customResourceName={layoutState?.midColumn?.resourceName}
              customNamespaceId={layoutState.midColumn?.namespaceId}
            />
          </div>
        )
      }
    />
  );
};
export const createExtensibilityRoutes = (cr, language) => {
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
            <ColumnWrapper resourceType={urlPath} />
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
