import React, { useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { usePrepareCreateProps } from 'resources/helpers';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';

const BusolaExtensionList = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionList'),
);
const BusolaExtensionDetails = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionDetails'),
);

const BusolaExtensionCreate = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionCreate'),
);

const ColumnWrapper = ({ defaultColumn = 'list' }) => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const { clusterUrl } = useUrl();

  const { t } = useTranslation();

  const { namespace, name } = useParams();

  const initialLayoutState = layout
    ? {
        layout: layout ?? layoutState?.layout,
        midColumn: {
          resourceName: name,
          resourceType: 'Extensions',
          namespaceId: namespace,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, namespace, name]); // eslint-disable-line react-hooks/exhaustive-deps

  const elementCreateProps = usePrepareCreateProps({
    resourceType: 'ConfigMap',
    resourceTypeForTitle: t('extensibility.title'),
    apiGroup: '',
    apiVersion: 'v1',
  });

  let startColumnComponent = null;

  if (!layout && defaultColumn === 'details') {
    startColumnComponent = (
      <BusolaExtensionDetails
        name={layoutState?.midColumn?.resourceName || name}
        namespace={layoutState.midColumn?.namespaceId || namespace}
      />
    );
  } else {
    startColumnComponent = (
      <BusolaExtensionList
        layoutCloseCreateUrl={clusterUrl('busolaextensions')}
      />
    );
  }

  let detailsMidColumn = null;
  if (!layoutState?.showCreate) {
    detailsMidColumn = (
      <BusolaExtensionDetails
        name={layoutState?.midColumn?.resourceName || name}
        namespace={layoutState.midColumn?.namespaceId || namespace}
      />
    );
  }

  const createMidColumn = (
    <ResourceCreate
      title={elementCreateProps.resourceTitle}
      confirmText={t('common.buttons.create')}
      layoutCloseCreateUrl={clusterUrl('busolaextensions')}
      renderForm={renderProps => {
        const createComponent = (
          <BusolaExtensionCreate
            {...renderProps}
            {...elementCreateProps}
            layoutNumber="StartColumn" // For ResourceCreate we want to set layoutNumber to previous column so detail are opened instead of create
          />
        );

        return <ErrorBoundary>{createComponent}</ErrorBoundary>;
      }}
    />
  );

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{startColumnComponent}</div>}
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
  );
};
export default (
  <>
    <Route path="busolaextensions" element={<ColumnWrapper />} />
    <Route
      path="busolaextensions/:namespace/:name"
      element={<ColumnWrapper defaultColumn="details" />}
    />
  </>
);
