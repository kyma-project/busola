import React from 'react';
import { Route, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';

const HelmReleasesList = React.lazy(() =>
  import('../../components/HelmReleases/HelmReleasesList'),
);

const HelmReleaseDetails = React.lazy(() =>
  import('../../components/HelmReleases/HelmReleasesDetails'),
);

const ColumnWrapper = ({ defaultColumn = 'list' }) => {
  const layoutState = useRecoilValue(columnLayoutState);
  const { namespaceId, releaseName } = useParams();

  usePrepareLayoutColumns({
    resourceType: 'HelmReleases',
    namespaceId: namespaceId,
    apiGroup: '',
    apiVersion: 'v1',
    resourceName: releaseName,
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
  });

  let startColumnComponent = null;
  if (layoutState.layout === 'OneColumn' && defaultColumn === 'details') {
    startColumnComponent = (
      <HelmReleaseDetails
        releaseName={layoutState?.midColumn?.resourceName || releaseName}
        namespace={layoutState?.midColumn?.namespaceId || namespaceId}
      />
    );
  } else {
    startColumnComponent = <HelmReleasesList />;
  }

  let midColumnComponent = null;
  if (!(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')) {
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
