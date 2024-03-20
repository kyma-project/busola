import React, { useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';

const HelmReleasesList = React.lazy(() =>
  import('../../components/HelmReleases/HelmReleasesList'),
);

const HelmReleaseDetails = React.lazy(() =>
  import('../../components/HelmReleases/HelmReleasesDetails'),
);

const ColumnWrapper = ({ defaultColumn = 'list' }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const { namespaceId, releaseName } = useParams();

  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled && layout ? layout : layoutState?.layout,
        midColumn: {
          resourceName: releaseName,
          resourceType: 'HelmReleases',
          namespaceId,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, isColumnLeyoutEnabled, namespaceId, releaseName]); // eslint-disable-line react-hooks/exhaustive-deps

  let startColumnComponent = null;

  if ((!layout || !isColumnLeyoutEnabled) && defaultColumn === 'details') {
    startColumnComponent = (
      <HelmReleaseDetails
        releaseName={layoutState?.midColumn?.resourceName || releaseName}
        namespace={layoutState?.midColumn?.namespaceId || namespaceId}
      />
    );
  } else {
    startColumnComponent = (
      <HelmReleasesList enableColumnLayout={isColumnLeyoutEnabled} />
    );
  }

  let midColumnComponent = null;
  if (
    (layoutState?.midColumn?.resourceName || isColumnLeyoutEnabled) &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')
  ) {
    midColumnComponent = (
      <HelmReleaseDetails
        releaseName={layoutState?.midColumn?.resourceName || releaseName}
        namespace={layoutState?.midColumn?.namespaceId || namespaceId}
      />
    );
  }
  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{startColumnComponent}</div>}
      midColumn={<div className="column-content">{midColumnComponent}</div>}
    />
  );
};
export default (
  <>
    <Route path="helm-releases" element={<ColumnWrapper />} />
    <Route
      path={'helm-releases/:releaseName'}
      element={<ColumnWrapper defaultColumn="details" />}
    />
  </>
);
