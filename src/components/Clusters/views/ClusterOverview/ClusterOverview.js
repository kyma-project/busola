import React from 'react';
// import { useRecoilValue } from 'recoil';

import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';

import './ClusterOverview.scss';
import { ClusterValidation } from './ClusterValidation/ClusterValidation';
import { useFeature } from 'hooks/useFeature';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  const clusterValidation = useFeature('CLUSTER_VALIDATION');
  return (
    <ClusterOverviewHeader
      content={
        <>
          <Injections
            destination="ClusterOverview"
            slot="details-top"
            root=""
          />
          <ClusterNodes />
          {clusterValidation?.isEnabled && <ClusterValidation />}
          <Injections destination="ClusterOverview" slot="details-bottom" />
        </>
      }
    />
  );
}
