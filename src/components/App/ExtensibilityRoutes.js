import React, { Suspense } from 'react';
import pluralize from 'pluralize';
import i18next from 'i18next';
import { Route, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';

import { Spinner } from 'shared/components/Spinner/Spinner';

const List = React.lazy(() => import('../Extensibility/ExtensibilityList'));
const Details = React.lazy(() =>
  import('../Extensibility/ExtensibilityDetails'),
);

const ColumnWrapper = ({ defaultColumn = 'list' }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const { namespaceId, resourceName } = useParams();
  const layoutState = useRecoilValue(columnLayoutState);

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
          <List enableColumnLayout={isColumnLeyoutEnabled} />
        </div>
      }
      midColumn={
        <div slot="">
          <Details
            customResourceName={layoutState?.midColumn?.resourceName}
            customNamespaceId={layoutState.midColumn?.namespaceId}
          />
        </div>
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
