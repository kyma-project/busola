import React, { useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';

const BusolaExtensionList = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionList'),
);
const BusolaExtensionDetails = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionDetails'),
);

const ColumnWrapper = ({ details }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const { namespace, name } = useParams();

  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);

  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled ? layout : 'OneColumn',
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

  if (!isColumnLeyoutEnabled) {
    if (details === true)
      return <BusolaExtensionDetails name={name} namespace={namespace} />;
  }

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={
        <div slot="">
          <BusolaExtensionList enableColumnLayout={isColumnLeyoutEnabled} />
        </div>
      }
      midColumn={
        layoutState?.midColumn && (
          <div slot="">
            <BusolaExtensionDetails
              name={layoutState?.midColumn?.resourceName}
              namespace={layoutState.midColumn?.namespaceId}
            />
          </div>
        )
      }
    />
  );
};
export default (
  <>
    <Route path="busolaextensions" element={<ColumnWrapper />} />
    <Route
      path="busolaextensions/:namespace/:name"
      element={<ColumnWrapper details={true} />}
    />
  </>
);
