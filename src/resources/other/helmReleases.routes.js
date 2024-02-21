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
  const { namespace, releaseName } = useParams();

  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled && layout ? layout : layoutState?.layout,
        midColumn: {
          resourceName: releaseName,
          resourceType: 'HelmReleases',
          namespaceId: namespace,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, isColumnLeyoutEnabled, namespace, releaseName]); // eslint-disable-line react-hooks/exhaustive-deps

  let startColumnComponent = null;

  if ((!layout || !isColumnLeyoutEnabled) && defaultColumn === 'details') {
    startColumnComponent = (
      <HelmReleaseDetails
        releaseName={layoutState?.midColumn?.resourceName || releaseName}
      />
    );
  } else {
    startColumnComponent = (
      <HelmReleasesList enableColumnLayout={isColumnLeyoutEnabled} />
    );
  }

  let midColumnComponent = null;
  if (layoutState?.midColumn?.resourceName) {
    midColumnComponent = (
      <HelmReleaseDetails
        releaseName={layoutState?.midColumn?.resourceName || releaseName}
      />
    );
  }
  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div slot="">{startColumnComponent}</div>}
      midColumn={<div slot="">{midColumnComponent}</div>}
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
